// Send a 6-digit OTP by email to allow the user to reset their wallet PIN.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Non authentifié" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user || !user.email) return j({ error: "Session invalide" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE);

    // Rate limit 60s
    const { data: recent } = await admin
      .from("login_otps")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("email", `pinreset:${user.email}`)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recent && Date.now() - new Date(recent.created_at).getTime() < 60_000) {
      return j({ error: "Patientez avant de redemander un code" }, 429);
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) return j({ error: "Service email indisponible" }, 500);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dukaio <noreply@mail.ecom-revolt.com>",
        to: [user.email],
        subject: `Réinitialisation PIN Wallet : ${code}`,
        html: `
          <div style="font-family:-apple-system,Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;background:#fff;">
            <h1 style="margin:0 0 24px;font-size:26px;background:linear-gradient(135deg,#5b1ea3,#d4a017);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;">Dukaio</h1>
            <h2 style="color:#1a1a1a;font-size:19px;margin:0 0 12px;">Réinitialisation de votre PIN Wallet</h2>
            <p style="color:#555;font-size:15px;line-height:1.6;">Vous avez demandé à réinitialiser votre PIN à 4 chiffres. Voici votre code de vérification :</p>
            <div style="text-align:center;margin:28px 0;">
              <div style="display:inline-block;background:linear-gradient(135deg,rgba(91,30,163,0.08),rgba(212,160,23,0.08));border:2px solid #5b1ea3;padding:18px 32px;border-radius:14px;font-size:34px;font-weight:700;letter-spacing:10px;color:#1a1a1a;font-family:'SF Mono',Menlo,monospace;">${code}</div>
            </div>
            <p style="color:#888;font-size:13px;text-align:center;">⏱ Ce code expire dans 10 minutes.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />
            <p style="color:#aaa;font-size:12px;text-align:center;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre PIN reste inchangé.</p>
          </div>
        `,
      }),
    });
    if (!emailRes.ok) {
      const t = await emailRes.text();
      console.error("Resend error:", t);
      return j({ error: "Erreur d'envoi de l'email" }, 502);
    }

    await admin.from("login_otps")
      .update({ used: true })
      .eq("user_id", user.id)
      .eq("email", `pinreset:${user.email}`)
      .eq("used", false);

    const { error: insErr } = await admin.from("login_otps").insert({
      user_id: user.id,
      email: `pinreset:${user.email}`,
      code,
      expires_at: expiresAt,
    });
    if (insErr) throw insErr;

    return j({ success: true });
  } catch (e: any) {
    console.error("wallet-pin-reset-send error:", e);
    return j({ error: e.message || "Erreur serveur" }, 500);
  }
  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
