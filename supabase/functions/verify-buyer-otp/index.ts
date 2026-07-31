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
    const { email, code } = await req.json();
    if (!email || !code) {
      return new Response(JSON.stringify({ error: "Email et code requis" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify OTP
    const { data: otp } = await admin
      .from("buyer_otps")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("code", code)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otp) {
      return new Response(JSON.stringify({ error: "Code invalide ou expiré" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await admin.from("buyer_otps").update({ used: true }).eq("id", otp.id);

    // Mark OTP verified timestamp on customer
    await admin
      .from("customers")
      .update({ last_otp_verified_at: new Date().toISOString() })
      .eq("email", normalizedEmail);

    // 2. Get customer
    const { data: customer } = await admin
      .from("customers")
      .select("id, name, email, phone, auth_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (!customer) {
      return new Response(JSON.stringify({ error: "Client non trouvé" }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Get or create Supabase auth user for this email
    let authUserId = customer.auth_id as string | null;

    if (!authUserId) {
      // Try to find existing auth user
      const { data: existing } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      const found = existing?.users?.find((u: any) => (u.email || "").toLowerCase() === normalizedEmail);
      if (found) {
        authUserId = found.id;
      } else {
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email: normalizedEmail,
          email_confirm: true,
          user_metadata: { buyer: true, name: customer.name },
        });
        if (createErr || !created.user) {
          console.error("createUser error:", createErr);
          return new Response(JSON.stringify({ error: "Impossible de créer la session" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        authUserId = created.user.id;
      }

      // Link customer.auth_id
      await admin.from("customers").update({ auth_id: authUserId }).eq("id", customer.id);
    }

    // 4. Generate magic link, then verify token to obtain session
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
    });

    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error("generateLink error:", linkErr);
      return new Response(JSON.stringify({ error: "Impossible de générer la session" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use anon client to verify the OTP hash and obtain a session
    const anonClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: verifyData, error: verifyErr } = await anonClient.auth.verifyOtp({
      type: "magiclink",
      token_hash: linkData.properties.hashed_token,
    });

    if (verifyErr || !verifyData.session) {
      console.error("verifyOtp error:", verifyErr);
      return new Response(JSON.stringify({ error: "Impossible d'établir la session" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Get orders enriched
    const { data: orders } = await admin
      .from("orders")
      .select("id, amount, status, created_at, product_id, store_owner_id")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    let enrichedOrders: any[] = [];
    if (orders && orders.length > 0) {
      const productIds = [...new Set(orders.map((o: any) => o.product_id))];
      const storeOwnerIds = [...new Set(orders.map((o: any) => o.store_owner_id))];

      const [productsRes, profilesRes] = await Promise.all([
        admin.from("products").select("id, title, type, thumbnail_url, download_url").in("id", productIds),
        admin.from("profiles").select("id, display_name, store_slug").in("id", storeOwnerIds),
      ]);

      enrichedOrders = orders.map((o: any) => ({
        id: o.id,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at,
        product: productsRes.data?.find((p: any) => p.id === o.product_id) || null,
        store_owner: profilesRes.data?.find((p: any) => p.id === o.store_owner_id) || null,
      }));
    }

    return new Response(JSON.stringify({
      success: true,
      customer: { ...customer, auth_id: authUserId },
      orders: enrichedOrders,
      session: {
        access_token: verifyData.session.access_token,
        refresh_token: verifyData.session.refresh_token,
      },
    }), {
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
