// Verify wallet PIN, return short-lived unlock token (15 min)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function getKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // reuse as HMAC secret
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Non authentifié" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return j({ error: "Non authentifié" }, 401);

    const { pin } = await req.json();
    if (!/^\d{4}$/.test(String(pin || ""))) return j({ error: "PIN invalide" }, 400);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: row } = await admin.from("wallet_pins").select("*").eq("user_id", user.id).maybeSingle();
    if (!row) return j({ error: "Aucun PIN défini", needs_setup: true });

    if (row.locked_until && new Date(row.locked_until) > new Date()) {
      return j({ error: "Wallet verrouillé temporairement. Réessayez plus tard." });
    }

    const ok = bcrypt.compareSync(String(pin), row.pin_hash);
    if (!ok) {
      const attempts = (row.failed_attempts || 0) + 1;
      const lock = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      await admin.from("wallet_pins").update({
        failed_attempts: attempts,
        locked_until: lock,
      }).eq("user_id", user.id);
      return j({ error: lock ? "5 essais échoués. Bloqué 15 min." : `PIN incorrect (${5 - attempts} essai(s) restant)` });
    }


    // Reset attempts
    await admin.from("wallet_pins").update({ failed_attempts: 0, locked_until: null }).eq("user_id", user.id);

    const key = await getKey();
    const token = await create(
      { alg: "HS256", typ: "JWT" },
      { sub: user.id, aud: "wallet", exp: getNumericDate(15 * 60) },
      key,
    );
    return j({ success: true, unlock_token: token, expires_in: 900 });
  } catch (e: any) {
    return j({ error: e.message }, 500);
  }
  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
