// Verifies an OAuth-authenticated buyer has a customer record, returns last_otp_verified_at
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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user || !user.email) {
      return new Response(JSON.stringify({ error: "Session invalide" }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const email = user.email.toLowerCase().trim();

    // Find customer by email
    const { data: customer } = await admin
      .from("customers")
      .select("id, name, email, auth_id, last_otp_verified_at")
      .eq("email", email)
      .maybeSingle();

    if (!customer) {
      return new Response(JSON.stringify({
        error: "Aucun achat trouvé pour cet email. Effectuez un premier achat pour accéder au portail.",
        no_customer: true,
      }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Link auth_id if missing
    if (!customer.auth_id) {
      await admin.from("customers").update({ auth_id: user.id }).eq("id", customer.id);
    }

    return new Response(JSON.stringify({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name || (user.user_metadata?.full_name as string) || "Client",
        email: customer.email,
      },
      last_otp_verified_at: customer.last_otp_verified_at,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error("buyer-oauth-check error:", e);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
