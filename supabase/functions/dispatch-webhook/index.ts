import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function computeHmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
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
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { event, store_owner_id, payload } = await req.json();

    if (!event || !store_owner_id) {
      return new Response(
        JSON.stringify({ error: "event and store_owner_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Dispatching webhooks for event: ${event}, store: ${store_owner_id}`);

    // Fetch all active webhooks for this store owner that listen to this event
    const { data: webhooks, error: fetchError } = await supabase
      .from("webhooks")
      .select("*")
      .eq("creator_id", store_owner_id)
      .eq("is_active", true)
      .contains("events", [event]);

    if (fetchError) {
      console.error("Error fetching webhooks:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch webhooks" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!webhooks || webhooks.length === 0) {
      console.log("No active webhooks found for this event");
      return new Response(
        JSON.stringify({ dispatched: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter by product_id if webhook has product filter
    const productId = payload?.product_id || payload?.product?.id;
    const filteredWebhooks = webhooks.filter((wh: any) => {
      if (!wh.product_ids || wh.product_ids.length === 0) return true;
      return productId && wh.product_ids.includes(productId);
    });

    console.log(`Found ${filteredWebhooks.length} matching webhooks`);

    const webhookPayload = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    // Send to each webhook endpoint
    const results = await Promise.allSettled(
      filteredWebhooks.map(async (wh: any) => {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "User-Agent": "Dukaio-Webhook/1.0",
          "X-Webhook-Event": event,
        };

        // Add HMAC signature if secret is configured
        if (wh.secret) {
          const signature = await computeHmac(wh.secret, webhookPayload);
          headers["X-Webhook-Signature"] = signature;
        }

        const startTime = Date.now();
        let responseStatus = 0;
        let responseBody = "";
        let success = false;

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

          const response = await fetch(wh.url, {
            method: "POST",
            headers,
            body: webhookPayload,
            signal: controller.signal,
          });

          clearTimeout(timeout);
          responseStatus = response.status;
          responseBody = await response.text().catch(() => "");
          // Truncate response body
          if (responseBody.length > 500) responseBody = responseBody.substring(0, 500) + "...";
          success = response.ok;
        } catch (fetchErr: any) {
          responseBody = fetchErr.message || "Connection failed";
          success = false;
        }

        // Log the delivery
        await supabase.from("webhook_logs").insert({
          webhook_id: wh.id,
          event,
          payload: { event, data: payload },
          response_status: responseStatus,
          response_body: responseBody,
          success,
          attempt: 1,
        });

        console.log(`Webhook ${wh.id} -> ${wh.url}: ${success ? "OK" : "FAILED"} (${responseStatus}) in ${Date.now() - startTime}ms`);

        return { webhook_id: wh.id, success, status: responseStatus };
      })
    );

    const dispatched = results.filter((r) => r.status === "fulfilled").length;
    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).success
    ).length;

    return new Response(
      JSON.stringify({ dispatched, succeeded }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Dispatch webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
