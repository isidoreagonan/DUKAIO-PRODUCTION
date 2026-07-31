import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non authentifié' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user || !user.email) {
      return new Response(JSON.stringify({ error: 'Session invalide' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Rate-limit: 1 successful send per 60s (only counts codes that were actually sent = used=false rows)
    const { data: recent } = await admin
      .from('login_otps')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent && Date.now() - new Date(recent.created_at).getTime() < 60_000) {
      return new Response(JSON.stringify({ error: 'Patientez avant de demander un nouveau code' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Service email indisponible' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();


    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dukaio <noreply@mail.ecom-revolt.com>',
        to: [user.email],
        subject: `Votre code de connexion : ${code}`,
        html: `
          <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; background: linear-gradient(135deg, #5b1ea3, #d4a017); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Dukaio</h1>
            </div>
            <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 12px;">Connexion sécurisée</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Pour des raisons de sécurité, nous avons besoin de vérifier votre identité. Voici votre code de connexion à usage unique :
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, rgba(91,30,163,0.08), rgba(212,160,23,0.08)); border: 2px solid #5b1ea3; padding: 20px 36px; border-radius: 14px; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #1a1a1a; font-family: 'SF Mono', Menlo, monospace;">${code}</div>
            </div>
            <p style="color: #888; font-size: 13px; text-align: center; margin: 0;">⏱ Ce code expire dans 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
            <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">
              Si vous n'avez pas tenté de vous connecter, ignorez cet email et changez votre mot de passe immédiatement.
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Resend error:', errText);
      let detail = "Erreur d'envoi de l'email";
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.message) detail = parsed.message;
      } catch (_) { /* ignore */ }
      return new Response(JSON.stringify({ error: detail }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Email sent successfully → invalidate old codes and persist the new one
    await admin.from('login_otps')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false);

    const { error: insertErr } = await admin.from('login_otps').insert({
      user_id: user.id,
      email: user.email,
      code,
      expires_at: expiresAt,
    });
    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-login-otp error:', e);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
