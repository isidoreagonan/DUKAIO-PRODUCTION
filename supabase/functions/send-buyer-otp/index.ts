const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email requis" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if this email has a customer record (has purchased something)
    const { data: customer } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (!customer) {
      return new Response(JSON.stringify({ error: "Aucun achat trouvé pour cet email" }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Invalidate previous codes
    await supabase
      .from("buyer_otps")
      .update({ used: true })
      .eq("email", email.toLowerCase().trim())
      .eq("used", false);

    // Store new code
    await supabase.from("buyer_otps").insert({
      email: email.toLowerCase().trim(),
      code,
      expires_at: expiresAt,
    });

    // Send via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Service email non configuré" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dukaio <noreply@mail.ecom-revolt.com>",
        to: [email],
        subject: `Votre code de connexion : ${code}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://nexozjpjbhqfjplrogvz.supabase.co/storage/v1/object/public/store-assets/brand/dukaio-logo.png" alt="Dukaio" width="48" height="48" style="display:block;margin:0 auto;border-radius:10px;" />
              <h2 style="margin: 10px 0 0; color: #1a1a1a;">Dukaio</h2>
            </div>
            <p style="color: #555; font-size: 15px;">Bonjour,</p>
            <p style="color: #555; font-size: 15px;">Voici votre code de connexion pour accéder à vos achats :</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #f4f4f5; padding: 16px 32px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a; font-family: monospace;">${code}</div>
            </div>
            <p style="color: #888; font-size: 13px; text-align: center;">Ce code expire dans 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #aaa; font-size: 12px; text-align: center;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", errBody);
      return new Response(JSON.stringify({ error: "Erreur d'envoi de l'email" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, customerName: customer.name }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
