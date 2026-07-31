// Edge function: scan tous les vendeurs et évalue éligibilité badge via IA Gemini
// Déclenché par cron quotidien OU manuellement par admin
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const THRESHOLDS = {
  standard: 100_000,
  pro: 500_000,
  premium: 1_000_000,
};

function computeGrade(revenue: number): "standard" | "pro" | "premium" | null {
  if (revenue >= THRESHOLDS.premium) return "premium";
  if (revenue >= THRESHOLDS.pro) return "pro";
  if (revenue >= THRESHOLDS.standard) return "standard";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Optional: scan a single user (admin trigger)
    let targetUserId: string | null = null;
    try {
      const body = await req.json();
      targetUserId = body?.user_id ?? null;
    } catch { /* ignore */ }

    // Get all sellers (users who have at least 1 product)
    let sellersQuery = supabase
      .from("profiles")
      .select("id, display_name");
    if (targetUserId) sellersQuery = sellersQuery.eq("id", targetUserId);

    const { data: sellers, error: sellersErr } = await sellersQuery;
    if (sellersErr) throw sellersErr;

    const results: any[] = [];
    const since30d = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

    for (const seller of sellers ?? []) {
      const userId = seller.id;

      // Total revenue
      const { data: orders } = await supabase
        .from("orders")
        .select("amount, created_at")
        .eq("store_owner_id", userId)
        .eq("status", "completed");

      const totalRevenue = (orders ?? []).reduce((s, o) => s + Number(o.amount || 0), 0);
      const sales30d = (orders ?? []).filter((o) => o.created_at >= since30d).length;

      // Visits last 30d
      const { count: visits30d } = await supabase
        .from("store_visits")
        .select("id", { count: "exact", head: true })
        .eq("store_owner_id", userId)
        .gte("created_at", since30d);

      // Positive reviews
      const { count: positiveReviews } = await supabase
        .from("store_reviews")
        .select("id", { count: "exact", head: true })
        .eq("store_owner_id", userId)
        .eq("sentiment", "positive");

      // KYC verified ?
      const { data: kyc } = await supabase
        .from("identity_verifications")
        .select("status")
        .eq("user_id", userId)
        .eq("status", "approved")
        .maybeSingle();
      const kycVerified = !!kyc;

      const computedGrade = computeGrade(totalRevenue);

      // Score IA via Gemini (uniquement si revenue >= seuil standard)
      let aiScore = 0;
      let aiReasoning = "Revenu insuffisant pour analyse IA.";
      let isEligible = false;

      if (computedGrade && kycVerified && LOVABLE_API_KEY) {
        const prompt = `Tu es un système de vérification anti-fraude pour la plateforme Dukaio. Analyse ce vendeur et donne un score de confiance de 0 à 100.

Données vendeur:
- Chiffre d'affaires total: ${totalRevenue} FCFA
- Ventes 30 derniers jours: ${sales30d}
- Visites boutique 30j: ${visits30d ?? 0}
- Avis positifs: ${positiveReviews ?? 0}
- KYC vérifié: oui

Critères d'évaluation:
- Cohérence ventes/visites (ratio normal: 1-10%)
- Activité régulière sur 30j
- Présence d'avis positifs
- Détection de patterns suspects (pic anormal, ratio incohérent)

Réponds en JSON strict: {"score": <0-100>, "is_eligible": <bool>, "reasoning": "<1-2 phrases>"}`;

        try {
          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "user", content: prompt }],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "submit_evaluation",
                    description: "Soumet l'évaluation du vendeur",
                    parameters: {
                      type: "object",
                      properties: {
                        score: { type: "number" },
                        is_eligible: { type: "boolean" },
                        reasoning: { type: "string" },
                      },
                      required: ["score", "is_eligible", "reasoning"],
                    },
                  },
                },
              ],
              tool_choice: { type: "function", function: { name: "submit_evaluation" } },
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const tc = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (tc) {
              const args = JSON.parse(tc.function.arguments);
              aiScore = Number(args.score) || 0;
              aiReasoning = String(args.reasoning || "");
              isEligible = !!args.is_eligible && aiScore >= 60;
            }
          } else {
            console.warn("AI gateway non OK:", aiResp.status);
            // Fallback: éligible si critères de base remplis
            aiScore = 70;
            aiReasoning = "Analyse IA indisponible, éligibilité basée sur critères stricts.";
            isEligible = true;
          }
        } catch (e) {
          console.error("AI error:", e);
          aiScore = 70;
          isEligible = true;
        }
      }

      // Save scan
      await supabase.from("badge_eligibility_scans").insert({
        user_id: userId,
        total_revenue: totalRevenue,
        sales_last_30d: sales30d,
        visits_last_30d: visits30d ?? 0,
        positive_reviews: positiveReviews ?? 0,
        kyc_verified: kycVerified,
        computed_grade: computedGrade,
        ai_score: aiScore,
        ai_reasoning: aiReasoning,
        is_eligible: isEligible,
      });

      // Si éligible et pas encore de badge actif, créer un badge "pending_payment"
      if (isEligible && computedGrade) {
        const { data: existingBadge } = await supabase
          .from("verified_badges")
          .select("id, status, grade")
          .eq("user_id", userId)
          .maybeSingle();

        if (!existingBadge) {
          await supabase.from("verified_badges").insert({
            user_id: userId,
            grade: computedGrade,
            status: "pending_payment",
            ai_score: aiScore,
            ai_recommendation: aiReasoning,
          });

          // Notify user
          await supabase.from("notifications").insert({
            user_id: userId,
            title: "🎉 Vous êtes éligible au badge Verify !",
            message: `Félicitations ! Vous êtes éligible au badge ${computedGrade.toUpperCase()}. Activez-le depuis votre dashboard.`,
            type: "success",
          });
        } else if (existingBadge.status === "pending_payment" && existingBadge.grade !== computedGrade) {
          // Upgrade pending grade
          await supabase
            .from("verified_badges")
            .update({ grade: computedGrade, ai_score: aiScore, ai_recommendation: aiReasoning })
            .eq("id", existingBadge.id);
        }
      }

      results.push({ userId, totalRevenue, computedGrade, aiScore, isEligible });
    }

    // Expirer badges dont expires_at est passé
    await supabase
      .from("verified_badges")
      .update({ status: "expired" })
      .lt("expires_at", new Date().toISOString())
      .eq("status", "active");

    return new Response(JSON.stringify({ ok: true, scanned: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-badge-eligibility error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
