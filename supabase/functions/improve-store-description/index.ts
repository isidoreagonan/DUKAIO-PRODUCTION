import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Description vide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (description.length > 20000) {
      return new Response(JSON.stringify({ error: "Description trop longue (max 20 000 caractères)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Tu es un expert en mise en page web pour des boutiques e-commerce.
Tu reçois une description de boutique en HTML (potentiellement mal structurée).
Ta mission : RÉORGANISER la mise en page UNIQUEMENT, sans rien changer au sens, ni au texte, ni aux emojis, ni aux liens, ni aux images.

RÈGLES STRICTES :
- NE JAMAIS modifier, traduire, résumer, ou reformuler les mots, phrases, slogans ou noms de marque
- NE JAMAIS supprimer ou ajouter du contenu (texte, emoji, lien, image, vidéo)
- Conserver TOUS les emojis exactement tels quels et à leur place logique
- Conserver TOUTES les URLs (images, liens) à l'identique
- Améliorer UNIQUEMENT la structure HTML : hiérarchie des titres (h1/h2/h3), paragraphes, listes <ul><li>, séparateurs <hr>, gras <strong>, italique <em>
- Utiliser une seule balise <h1> en haut (titre principal), puis <h2> pour sections, <h3> pour sous-sections
- Transformer les listes d'éléments séparés par ✅ ✔️ 🔥 💎 en vraies listes <ul><li> tout en GARDANT l'emoji au début de chaque <li>
- Ajouter des <hr> entre les grandes sections pour aérer
- Espacer le contenu avec des paragraphes <p> propres
- Retirer les balises vides (<p></p>) et les attributs inutiles
- Garder les images <img> avec leurs attributs src/class

RÉPONDS UNIQUEMENT AVEC LE HTML AMÉLIORÉ, sans markdown, sans \`\`\`, sans commentaire, sans explication.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: description },
        ],
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResponse.status === 402) {
      return new Response(JSON.stringify({ error: "Crédits IA épuisés. Contactez l'administrateur." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, t);
      return new Response(JSON.stringify({ error: "Erreur IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResponse.json();
    let improved: string = data.choices?.[0]?.message?.content || "";

    // Strip accidental markdown code fences
    improved = improved.trim()
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    if (!improved) {
      return new Response(JSON.stringify({ error: "Réponse IA vide" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ improved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("improve-store-description error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
