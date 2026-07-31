// Set or reset the wallet PIN (4 digits)
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return j({ error: "Non authentifié" }, 401);

    const { pin, currentPin } = await req.json();
    if (!/^\d{4}$/.test(String(pin || ""))) return j({ error: "PIN doit être 4 chiffres" }, 400);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Check if user already has a PIN
    const { data: existing } = await admin.from("wallet_pins").select("pin_hash").eq("user_id", user.id).maybeSingle();
    if (existing) {
      if (!currentPin) return j({ error: "PIN actuel requis pour modifier" }, 400);
      const ok = bcrypt.compareSync(String(currentPin), existing.pin_hash);
      if (!ok) return j({ error: "PIN actuel incorrect" }, 403);
    }

    const hash = bcrypt.hashSync(String(pin));
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
    return j({ error: e.message }, 500);
  }
  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
