// Visual search: upload an image, Gemini Vision extracts keywords, then full-text search
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64, image_mime } = await req.json();
    if (!image_base64) {
      return new Response(JSON.stringify({ error: "image_base64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // 1) Ask Gemini to describe the image with marketplace keywords
    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "Tu es un moteur de recherche visuel pour une marketplace de produits numériques (fichiers, formations, licences logicielles). Analyse l'image et retourne UNIQUEMENT 5 à 10 mots-clés en français, séparés par des virgules, qui décrivent ce que l'utilisateur cherche probablement (catégorie, sujet, style, secteur). Aucune phrase, juste les mots-clés.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Décris cette image en mots-clés de recherche." },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${image_mime || "image/jpeg"};base64,${image_base64}`,
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, txt);
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error("AI vision failed");
    }

    const aiData = await aiResp.json();
    const keywords: string =
      aiData.choices?.[0]?.message?.content?.trim() || "";

    // 2) Use the keywords to search products
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const terms = keywords
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2)
      .slice(0, 8);

    const orFilter = terms
      .map((t) => `title.ilike.%${t}%,description.ilike.%${t}%`)
      .join(",");

    let query = supabase
      .from("products")
      .select(
        "id, title, description, price, original_price, thumbnail_url, type, category, sales_count, creator_id",
      )
      .eq("is_published", true)
      .limit(24);

    if (orFilter) query = query.or(orFilter);
    query = query.order("sales_count", { ascending: false });

    const { data: products, error } = await query;
    if (error) throw error;

    const creatorIds = [...new Set((products || []).map((p) => p.creator_id))];
    let creators: Record<string, any> = {};
    if (creatorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, store_slug, store_logo_url, avatar_url")
        .in("id", creatorIds);
      creators = Object.fromEntries((profs || []).map((p) => [p.id, p]));
    }

    const enriched = (products || []).map((p) => ({
      ...p,
      store: creators[p.creator_id] || null,
    }));

    return new Response(
      JSON.stringify({ keywords, products: enriched }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("visual-search error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
