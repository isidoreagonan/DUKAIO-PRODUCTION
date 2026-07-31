import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("GROQ_API_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!lovableApiKey) throw new Error("GROQ_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const authClient = createClient(supabaseUrl, anonKey);
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) throw new Error("Unauthorized");

    const { productId } = await req.json();
    if (!productId) throw new Error("productId requis");

    const { data: product } = await adminClient
      .from("products")
      .select("id, title, description, type, price, original_price, thumbnail_url, download_url, creator_id")
      .eq("id", productId)
      .eq("creator_id", user.id)
      .single();

    if (!product) throw new Error("Produit introuvable");

    const { data: profile } = await adminClient
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const userPrompt = `Analyse ce produit numérique avant publication sur une marketplace.

IMPORTANT — Tu dois être TOLÉRANT et PEU SÉVÈRE. La plupart des produits sont légitimes.

Tu ne dois BLOQUER (rejected) QUE dans ces cas GRAVES :
- Le produit promet un enrichissement rapide / facile / garanti aux acheteurs (ex: "Gagnez 1000€/jour sans rien faire")
- Le produit est clairement illégal (drogues, armes, contenu pédopornographique, piratage)
- Le produit est une arnaque évidente et flagrante

Pour TOUT le reste, tu dois approuver (approved). Ne sois PAS sévère sur :
- Les descriptions marketing normales, même un peu enthousiastes
- Les produits de formation, e-books, templates, fichiers numériques classiques
- Les prix élevés (c'est le choix du vendeur)
- Les descriptions courtes ou imparfaites
- Les images manquantes ou de qualité moyenne

Si tu as un DOUTE sur un cas complexe (pas clairement illégal, mais suspect), utilise le statut "needs_review" pour signaler à l'admin sans bloquer le créateur.

Produit :
- Vendeur : ${profile?.display_name || user.email || "Créateur"}
- Type : ${product.type}
- Titre : ${product.title}
- Prix : ${product.price} FCFA
- Prix barré : ${product.original_price ?? "aucun"}
- Description : ${product.description || "Aucune description"}
- Fichier : ${product.download_url ? "Oui" : "Non"}
- Image : ${product.thumbnail_url || "Aucune image"}

Décision attendue :
- approved : conforme (utilise ceci dans la grande majorité des cas)
- rejected : UNIQUEMENT pour promesse d'enrichissement direct ou contenu clairement illégal
- needs_review : cas douteux/complexe à signaler à l'admin pour vérification manuelle
`;

    const messages: any[] = [
      {
        role: "system",
        content:
          "Tu es un modérateur tolérant de marketplace digitale. Tu approuves la grande majorité des produits. Tu ne bloques QUE les cas graves (enrichissement garanti, illégalité flagrante). Pour les cas douteux, tu utilises needs_review.",
      },
      {
        role: "user",
        content: product.thumbnail_url
          ? [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: product.thumbnail_url } },
            ]
          : userPrompt,
      },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "return_product_review",
              description: "Retourne la décision de modération du produit",
              parameters: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["approved", "needs_review", "rejected"],
                  },
                  summary: { type: "string" },
                  issues: {
                    type: "array",
                    items: { type: "string" },
                  },
                  suggested_fixes: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["status", "summary", "issues", "suggested_fixes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "return_product_review" },
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error("Rate limit IA atteint, réessayez dans un instant.");
      if (response.status === 402) throw new Error("Crédits IA insuffisants.");
      throw new Error(await response.text());
    }

    const payload = await response.json();
    const toolCall = payload.choices?.[0]?.message?.tool_calls?.[0];
    const parsed = JSON.parse(toolCall?.function?.arguments || "{}");

    // Map needs_review to warning for DB enum, but keep the logic
    const isNeedsReview = parsed.status === "needs_review";
    const dbStatus = isNeedsReview ? "warning" : (parsed.status || "warning");

    const review = {
      status: parsed.status || "approved",
      summary: parsed.summary || "Produit conforme.",
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      suggested_fixes: Array.isArray(parsed.suggested_fixes) ? parsed.suggested_fixes : [],
      reviewed_at: new Date().toISOString(),
    };

    await adminClient
      .from("product_moderation_reviews")
      .insert({
        product_id: product.id,
        creator_id: user.id,
        status: dbStatus,
        summary: review.summary,
        issues: review.issues,
        suggested_fixes: review.suggested_fixes,
        raw_result: payload,
        reviewed_at: review.reviewed_at,
      });

    // For needs_review: silently send email to admin, don't show popup to creator
    if (isNeedsReview && resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Dukaio <noreply@mail.ecom-revolt.com>",
            to: ["isidoreagonan@gmail.com"],
            subject: `⚠️ Modération IA — Produit à vérifier : ${product.title}`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#f59e0b;">⚠️ Produit signalé pour vérification manuelle</h2>
                <p>L'IA de modération a détecté un cas complexe nécessitant votre attention.</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                  <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Vendeur</td><td style="padding:8px;border:1px solid #e5e7eb;">${profile?.display_name || user.email}</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Produit</td><td style="padding:8px;border:1px solid #e5e7eb;">${product.title}</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Type</td><td style="padding:8px;border:1px solid #e5e7eb;">${product.type}</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Prix</td><td style="padding:8px;border:1px solid #e5e7eb;">${product.price} FCFA</td></tr>
                  <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">ID Produit</td><td style="padding:8px;border:1px solid #e5e7eb;">${product.id}</td></tr>
                </table>
                <h3>Résumé IA</h3>
                <p>${review.summary}</p>
                ${review.issues.length > 0 ? `<h3>Points détectés</h3><ul>${review.issues.map((i: string) => `<li>${i}</li>`).join("")}</ul>` : ""}
                <p style="margin-top:20px;color:#6b7280;font-size:12px;">Ce produit a été publié mais nécessite votre vérification. Vous pouvez le désactiver ou le supprimer depuis le panneau admin.</p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send admin notification email:", emailErr);
      }
    }

    return new Response(JSON.stringify({ review }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("analyze-product-moderation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
