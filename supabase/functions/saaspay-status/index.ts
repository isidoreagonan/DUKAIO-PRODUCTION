// SaaSPay status verification polling endpoint
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SAASPAY_BASE_URL = Deno.env.get("SAASPAY_BASE_URL") || "https://api.saspay.me/api/v1";

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { paymentId, reference } = await req.json();
    if (!paymentId && !reference) {
      return json({ error: "paymentId ou reference requis" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Check if order is already completed in database (via webhook)
    let orderQuery = supabase.from("orders").select("id, status, product_id, customer_id");
    if (paymentId) {
      orderQuery = orderQuery.or(`pawapay_deposit_id.eq.${paymentId},moneroo_transaction_id.eq.${paymentId}`);
    } else if (reference) {
      orderQuery = orderQuery.eq("moneroo_transaction_id", reference);
    }

    const { data: existingOrder } = await orderQuery.maybeSingle();

    if (existingOrder && existingOrder.status === "completed") {
      return json({ status: "success", orderId: existingOrder.id });
    }

    // 2. Query SaaSPay verify API if paymentId is available
    const apiKey = Deno.env.get("SAASPAY_SECRET_KEY");
    if (apiKey && paymentId && !paymentId.startsWith("DK-")) {
      try {
        const verifyRes = await fetch(`${SAASPAY_BASE_URL}/payments/${paymentId}/verify/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          const rawStatus = (verifyData.status || "").toLowerCase();

          if (rawStatus === "success" || rawStatus === "completed") {
            return json({ status: "success", orderId: existingOrder?.id });
          } else if (rawStatus === "failed" || rawStatus === "rejected" || rawStatus === "cancelled") {
            return json({ status: "failed", error: verifyData.message || "Paiement refusé" });
          }
        }
      } catch (apiErr) {
        console.warn("[saaspay-status] verify API warning:", apiErr);
      }
    }

    // 3. Fallback: check payment_events
    if (paymentId) {
      const { data: ev } = await supabase
        .from("payment_events")
        .select("status")
        .eq("pawapay_deposit_id", paymentId)
        .maybeSingle();

      if (ev?.status === "success") {
        return json({ status: "success", orderId: existingOrder?.id });
      }
      if (ev?.status === "failed") {
        return json({ status: "failed" });
      }
    }

    return json({ status: "pending" });
  } catch (err: any) {
    console.error("[saaspay-status] error:", err);
    return json({ error: err.message }, 500);
  }
});

