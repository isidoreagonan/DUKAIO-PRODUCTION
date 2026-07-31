// Verify OTP and set a new wallet PIN.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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

    const { code, new_pin } = await req.json();
    if (!/^\d{6}$/.test(String(code || ""))) return j({ error: "Code OTP invalide" }, 400);
    if (!/^\d{4}$/.test(String(new_pin || ""))) return j({ error: "Le PIN doit contenir 4 chiffres" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE);

    const { data: otp } = await admin
      .from("login_otps")
      .select("id, code, expires_at, used")
      .eq("user_id", user.id)
      .eq("email", `pinreset:${user.email}`)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otp) return j({ error: "Aucun code en attente. Demandez-en un nouveau." }, 404);
    if (new Date(otp.expires_at) < new Date()) return j({ error: "Code expiré" }, 410);
    if (String(otp.code) !== String(code)) return j({ error: "Code incorrect" }, 403);

    // Mark OTP used
    await admin.from("login_otps").update({ used: true }).eq("id", otp.id);

    // Reset PIN
    const hash = bcrypt.hashSync(String(new_pin));
    const { error } = await admin.from("wallet_pins").upsert({
      user_id: user.id,
      pin_hash: hash,
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    });
    if (error) return j({ error: error.message }, 400);

    return j({ success: true });
  } catch (e: any) {
    console.error("wallet-pin-reset-confirm error:", e);
    return j({ error: e.message || "Erreur serveur" }, 500);
  }
  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
