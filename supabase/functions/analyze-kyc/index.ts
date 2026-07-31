import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { verificationId } = await req.json();

    if (!verificationId) {
      return new Response(JSON.stringify({ error: "verificationId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the verification record
    const { data: verification, error: fetchError } = await supabaseAdmin
      .from("identity_verifications")
      .select("*")
      .eq("id", verificationId)
      .single();

    if (fetchError || !verification) {
      throw new Error("Verification not found");
    }

    // Build the AI prompt with document URLs and submitted info
    const documentUrls = [verification.document_front_url];
    if (verification.document_back_url) documentUrls.push(verification.document_back_url);
    if (verification.selfie_url) documentUrls.push(verification.selfie_url);

    const systemPrompt = `Tu es un expert en vérification d'identité (KYC) pour une plateforme de vente de produits numériques en Afrique. 
Tu dois analyser les informations soumises et les images de documents d'identité pour donner une recommandation.

CRITÈRES D'ANALYSE :
1. **Cohérence du nom** : Le nom complet soumis doit correspondre au type de document déclaré
2. **Complétude des informations** : Tous les champs obligatoires (nom, pays, ville) doivent être remplis correctement
3. **Type de document** : Vérifier que le type déclaré (CNI, passeport, permis) est cohérent
4. **Qualité des images** : Les URLs des documents sont-elles fournies ? Un selfie est-il présent ?
5. **Cohérence géographique** : Le pays et la ville déclarés sont-ils plausibles ?

Tu dois utiliser la fonction analyze_kyc_document pour retourner ton analyse structurée.`;

    const userPrompt = `Analyse cette demande de vérification KYC :

- **Nom complet soumis** : ${verification.full_name || "NON RENSEIGNÉ"}
- **Pays** : ${verification.country || "NON RENSEIGNÉ"}
- **Ville** : ${verification.city || "NON RENSEIGNÉ"}
- **Type de document déclaré** : ${verification.document_type}
- **Photo recto** : ${verification.document_front_url ? "Fournie" : "MANQUANTE"}
- **Photo verso** : ${verification.document_back_url ? "Fournie" : "Non fournie"}
- **Selfie** : ${verification.selfie_url ? "Fourni" : "Non fourni"}

Analyse ces informations et donne ta recommandation.`;

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_kyc_document",
              description: "Retourne l'analyse structurée du dossier KYC",
              parameters: {
                type: "object",
                properties: {
                  recommendation: {
                    type: "string",
                    enum: ["approve", "review", "reject"],
                    description: "approve = tout semble correct, review = des points nécessitent une vérification manuelle, reject = problèmes majeurs détectés",
                  },
                  confidence: {
                    type: "number",
                    description: "Score de confiance entre 0 et 100",
                  },
                  details: {
                    type: "string",
                    description: "Analyse détaillée en français expliquant les points vérifiés, les problèmes détectés et les recommandations pour l'administrateur. Inclure des commentaires sur la cohérence du nom, la complétude des documents, et tout point d'attention.",
                  },
                },
                required: ["recommendation", "confidence", "details"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_kyc_document" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    
    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("AI did not return structured analysis");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Update the verification record with AI analysis
    const { error: updateError } = await supabaseAdmin
      .from("identity_verifications")
      .update({
        ai_recommendation: analysis.recommendation,
        ai_confidence: analysis.confidence,
        ai_analysis_details: analysis.details,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq("id", verificationId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: {
        recommendation: analysis.recommendation,
        confidence: analysis.confidence,
        details: analysis.details,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-kyc error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
