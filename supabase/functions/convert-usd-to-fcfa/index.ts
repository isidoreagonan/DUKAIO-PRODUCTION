// AI-powered USD -> FCFA conversion (uses Lovable AI Gateway with web search)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY = "https://api.groq.com/openai/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) return j({ error: "GROQ_API_KEY non configuré" }, 500);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Non authentifié" }, 401);
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return j({ error: "Non authentifié" }, 401);

    const { amount_usd, preview } = await req.json();
    if (!amount_usd || amount_usd <= 0) return j({ error: "Montant USD invalide" }, 400);

    // Check available USD balance (unless just previewing)
    const { data: wallet } = await service.from("user_wallets")
      .select("balance_usd").eq("user_id", user.id).maybeSingle();
    const available = Number(wallet?.balance_usd || 0);
    if (!preview && amount_usd > available) {
      return j({ error: `Solde USD insuffisant. Disponible: $${available.toFixed(2)}` }, 400);
    }

    // ---- Call AI to get current rate ----
    const aiPrompt = `Tu es un expert en taux de change forex temps réel. Donne le taux de change actuel USD vers XOF (Franc CFA BCEAO d'Afrique de l'Ouest). Le taux est généralement entre 550 et 650 FCFA pour 1 USD. Réponds STRICTEMENT en JSON valide, sans markdown, format: {"rate": <nombre>, "source": "<source citée>", "date": "<ISO date>", "confidence": "high|medium|low"}.`;

    const aiResp = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Tu réponds uniquement en JSON valide sans aucun texte additionnel ni markdown." },
          { role: "user", content: aiPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("[convert-usd-to-fcfa] AI error", aiResp.status, txt);
      return j({ error: "Service de taux indisponible" }, 502);
    }

    const aiData = await aiResp.json();
    let parsed: any = {};
    try {
      const content = aiData?.choices?.[0]?.message?.content || "{}";
      parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
    } catch (e) {
      console.error("[convert-usd-to-fcfa] parse error", e);
    }

    let rate = Number(parsed?.rate);
    // Sanity check (sane bounds)
    if (!rate || rate < 400 || rate > 800) {
      rate = 600; // fallback
      parsed.source = (parsed.source || "fallback") + " (corrigé)";
      parsed.confidence = "low";
    }

    const amountFcfa = Math.round(amount_usd * rate);

    // Preview only - don't commit
    if (preview) {
      return j({
        preview: true, rate, amount_usd, amount_fcfa: amountFcfa,
        source: parsed.source, date: parsed.date, confidence: parsed.confidence,
      });
    }

    // ---- Commit conversion ----
    const { data: conv, error: convErr } = await service.from("currency_conversions").insert({
      user_id: user.id,
      amount_usd,
      rate_used: rate,
      amount_fcfa: amountFcfa,
      ai_analysis: parsed,
      ai_source: parsed.source || "AI",
      status: "completed",
      completed_at: new Date().toISOString(),
    }).select("id").single();
    if (convErr) return j({ error: convErr.message }, 500);

    // Debit USD
    const newUsd = available - amount_usd;
    // Credit FCFA
    const { data: w2 } = await service.from("user_wallets")
      .select("balance_fcfa").eq("user_id", user.id).single();
    const newFcfa = Number(w2?.balance_fcfa || 0) + amountFcfa;

    await service.from("user_wallets").update({
      balance_usd: newUsd,
      balance_fcfa: newFcfa,
    }).eq("user_id", user.id);

    // Log both transactions
    await service.from("wallet_transactions").insert([
      {
        user_id: user.id, wallet_currency: "USD", type: "conversion",
        amount: -amount_usd, balance_after: newUsd,
        reference_id: conv.id, reference_type: "conversion",
        status: "completed", description: `Conversion USD→FCFA à ${rate}`,
      },
      {
        user_id: user.id, wallet_currency: "FCFA", type: "conversion",
        amount: amountFcfa, balance_after: newFcfa,
        reference_id: conv.id, reference_type: "conversion",
        status: "completed", description: `Conversion USD→FCFA à ${rate}`,
      },
    ]);

    return j({
      success: true, conversion_id: conv.id, rate, amount_usd, amount_fcfa: amountFcfa,
      source: parsed.source, date: parsed.date,
    });
  } catch (err: any) {
    console.error("[convert-usd-to-fcfa]", err);
    return j({ error: err.message }, 500);
  }

  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
