import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es l'assistant IA d'Dukaio, une plateforme qui permet aux créateurs de vendre des produits numériques en Afrique. Tu es amical, professionnel et concis.

## Ce que tu sais sur Dukaio :

### Fonctionnalités principales :
- **Vente de produits numériques** : fichiers téléchargeables, formations en ligne, licences logicielles
- **Boutique personnalisée** : chaque vendeur a sa propre boutique avec un lien unique (slug personnalisable)
- **Paiements** : via Moneroo (Mobile Money MTN, Orange, Moov, Wave + cartes bancaires)
- **Tableau de bord** : suivi des ventes, clients, revenus, analytiques détaillées
- **Marketing** : codes promo, campagnes email, affiliation, automatisations
- **Licences** : génération automatique de clés, activation par appareil, validation API
- **Webhooks (Pulses)** : notifications HTTP en temps réel pour intégrer avec d'autres services
- **Personnalisation** : thèmes, couleurs, polices, mise en page de la boutique
- **Retraits** : vers Mobile Money avec commission de 10%

### Comment ça marche :
1. Créer un compte sur Dukaio
2. Compléter l'onboarding (nom de boutique, slug, etc.)
3. Ajouter des produits (fichiers, formations, licences)
4. Partager le lien de sa boutique
5. Recevoir des paiements automatiquement
6. Retirer ses gains sur Mobile Money

### Tarification :
- Inscription gratuite
- Commission de 10% sur chaque vente
- Pas de frais fixes mensuels

### Support :
- Centre d'aide disponible
- Si le client veut parler à un humain, tu peux créer un ticket support

## Règles :
- Réponds toujours en français
- Sois concis et utile
- Si tu ne connais pas la réponse, dis-le honnêtement
- Si l'utilisateur demande à parler à un humain/support/admin, indique que tu vas créer un ticket et le transférer
- Ne donne jamais d'informations techniques internes (noms de tables, clés API, etc.)
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, user_name, user_email } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Check if user wants human support
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const wantsHuman = /parler.*(support|humain|admin|agent|quelqu'un|personne)|contacter.*(support|admin)|besoin.*(aide|humain)|transfert|escalade/i.test(lastMessage);

    const systemMessage = {
      role: "system",
      content: SYSTEM_PROMPT + (wantsHuman
        ? `\n\nL'utilisateur veut parler à un humain. Réponds-lui que tu vas créer un ticket de support et qu'un membre de l'équipe le contactera très bientôt. Demande-lui de décrire brièvement son problème si ce n'est pas déjà fait. Termine ta réponse par exactement: [ESCALATE]`
        : ""),
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [systemMessage, ...messages],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";

    const shouldEscalate = aiMessage.includes("[ESCALATE]");
    const cleanMessage = aiMessage.replace("[ESCALATE]", "").trim();

    return new Response(JSON.stringify({
      message: cleanMessage,
      escalate: shouldEscalate,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({
      message: "Désolé, une erreur est survenue. Veuillez réessayer.",
      escalate: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
