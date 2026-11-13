import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(str: string): Promise<string> {
  if (!str) return "";
  const data = new TextEncoder().encode(str.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    let {
      pixel_id,
      access_token,
      store_owner_id,
      event_name = "Purchase",
      event_id,
      event_source_url,
      user_data = {},
      custom_data = {},
      test_event_code,
    } = body;

    // If store_owner_id is provided, look up pixel_id & access_token from profiles
    if ((!pixel_id || !access_token) && store_owner_id) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("facebook_pixel_id, facebook_capi_token")
        .eq("id", store_owner_id)
        .maybeSingle();

      if (profile) {
        if (!pixel_id) pixel_id = profile.facebook_pixel_id;
        if (!access_token) access_token = profile.facebook_capi_token;
      }
    }

    if (!pixel_id || !access_token) {
      return new Response(
        JSON.stringify({
          error: "Pixel ID et Access Token Meta sont requis pour l'API Conversions (CAPI).",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Build hashed user_data according to Meta requirements
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      user_data.client_ip_address;
    const clientUserAgent = req.headers.get("user-agent") || user_data.client_user_agent;

    const formattedUserData: Record<string, any> = {
      client_ip_address: clientIp,
      client_user_agent: clientUserAgent,
    };

    if (user_data.email) {
      formattedUserData.em = [await sha256(user_data.email)];
    }
    if (user_data.phone) {
      // Clean phone to only digits and country code
      const cleanPhone = String(user_data.phone).replace(/[^0-9]/g, "");
      if (cleanPhone) formattedUserData.ph = [await sha256(cleanPhone)];
    }
    if (user_data.first_name) {
      formattedUserData.fn = [await sha256(user_data.first_name)];
    }
    if (user_data.last_name) {
      formattedUserData.ln = [await sha256(user_data.last_name)];
    }

    const eventPayload: Record<string, any> = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: event_source_url || "https://dukaio.com",
      user_data: formattedUserData,
      custom_data: {
        currency: custom_data.currency || "XOF",
        value: custom_data.value !== undefined ? Number(custom_data.value) : undefined,
        content_name: custom_data.content_name,
        content_ids: custom_data.content_ids,
        content_type: custom_data.content_type || "product",
        num_items: custom_data.num_items || 1,
      },
    };

    if (event_id) {
      eventPayload.event_id = String(event_id);
    }

    const fbRequestBody: Record<string, any> = {
      data: [eventPayload],
    };

    if (test_event_code) {
      fbRequestBody.test_event_code = test_event_code;
    }

    // Post to Meta Graph API
    const fbUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(
      pixel_id.trim()
    )}/events?access_token=${encodeURIComponent(access_token.trim())}`;

    const fbRes = await fetch(fbUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fbRequestBody),
    });

    const fbData = await fbRes.json();

    if (!fbRes.ok || fbData.error) {
      console.error("[Meta CAPI Error]", fbData);
      return new Response(
        JSON.stringify({
          error: fbData.error?.message || "Erreur de transmission vers Meta Conversions API",
          details: fbData,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: fbRes.status || 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        events_received: fbData.events_received,
        fb_trace_id: fbData.fb_trace_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[Meta CAPI Handler Exception]", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur interne" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

