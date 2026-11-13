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
      return new Response(JSON.stringify({ success: false, error: "Email et code requis" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "sb_publishable_CEN7ofi1v_Bik6IMGmvHMQ_pyNU-0a9";

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify OTP in buyer_otps
    const { data: otp } = await admin
      .from("buyer_otps")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("code", String(code).trim())
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otp) {
      return new Response(JSON.stringify({ success: false, error: "Code de vérification invalide ou expiré." }), {
        status: 200,
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
      return new Response(JSON.stringify({ success: false, error: "Aucun profil acheteur trouvé pour cet email." }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Optional: Attempt to establish Supabase Auth session
    let authUserId = customer.auth_id as string | null;
    let sessionPayload: any = null;

    try {
      let { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

      if (linkErr && (linkErr.message?.toLowerCase().includes("user not found") || (linkErr as any).status === 404)) {
        const { data: created } = await admin.auth.admin.createUser({
          email: normalizedEmail,
          email_confirm: true,
          user_metadata: { buyer: true, name: customer.name },
        });
        if (created?.user) {
          authUserId = created.user.id;
          const retryRes = await admin.auth.admin.generateLink({
            type: "magiclink",
            email: normalizedEmail,
          });
          linkData = retryRes.data;
          linkErr = retryRes.error;
        }
      }

      if (!linkErr && linkData?.properties?.hashed_token) {
        if (linkData?.user?.id) {
          authUserId = linkData.user.id;
        }
        if (authUserId && customer.auth_id !== authUserId) {
          await admin.from("customers").update({ auth_id: authUserId }).eq("id", customer.id);
        }

        const anonClient = createClient(SUPABASE_URL, ANON_KEY);
        const { data: verifyData } = await anonClient.auth.verifyOtp({
          type: "magiclink",
          token_hash: linkData.properties.hashed_token,
        });

        if (verifyData?.session) {
          sessionPayload = {
            access_token: verifyData.session.access_token,
            refresh_token: verifyData.session.refresh_token,
          };
        }
      }
    } catch (authErr) {
      console.warn("Non-fatal session establishment issue:", authErr);
    }

    // 4. Get customer orders
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
      session: sessionPayload,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Fatal verify-buyer-otp error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "Erreur de validation du code" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
