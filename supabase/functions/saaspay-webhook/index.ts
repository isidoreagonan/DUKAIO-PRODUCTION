// SaaSPay Webhook Handler
// Handles HMAC-SHA256 signature verification, order finalization, 5% Dukaio commission split, and wallet crediting
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp",
};

// HMAC-SHA256 helper using Web Crypto API
async function verifyHmacSignature(secret: string, timestamp: string, rawBody: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(`${timestamp}.${rawBody}`);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const computedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return computedSignature.toLowerCase() === signature.trim().toLowerCase();
  } catch (err) {
    console.error("[saaspay-webhook] signature computation error:", err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    const webhookSecret = Deno.env.get("SAASPAY_WEBHOOK_SECRET");

    console.log("[saaspay-webhook] incoming raw payload:", rawBody.slice(0, 500));

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      // Replay attack check: reject if older than 5 minutes (300 seconds)
      const now = Math.floor(Date.now() / 1000);
      const reqTime = parseInt(timestamp, 10);
      if (reqTime && Math.abs(now - reqTime) > 300) {
        console.warn("[saaspay-webhook] rejected: timestamp expired (> 300s)", { now, reqTime });
        return new Response("Timestamp expired", { status: 400 });
      }

      const isValid = await verifyHmacSignature(webhookSecret, timestamp, rawBody, signature);
      if (!isValid) {
        console.warn("[saaspay-webhook] invalid HMAC signature");
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = (payload.event || payload.type || "").toLowerCase();
    const data = payload.data || payload;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const transactionId = data.id || data.payment_id || data.transaction_id;
    const reference = data.reference || data.order_reference;
    const amount = Number(data.amount || 0);

    console.log(`[saaspay-webhook] processing event "${eventType}" for transaction ${transactionId} (ref: ${reference})`);

    // ========================================================
    // 1. PAYOUT / WITHDRAWAL EVENTS
    // ========================================================
    if (eventType.includes("settlement.") || eventType.includes("payout.")) {
      const payoutStatus = eventType.includes("success") || eventType.includes("approved") ? "completed" : "failed";
      
      const { data: w } = await supabase
        .from("withdrawals")
        .select("id, user_id, amount, status")
        .or(`pawapay_payout_id.eq.${transactionId},moneroo_transaction_id.eq.${reference}`)
        .maybeSingle();

      if (w && w.status !== payoutStatus) {
        await supabase.from("withdrawals").update({ status: payoutStatus }).eq("id", w.id);

        if (payoutStatus === "failed") {
          // Refund seller balance
          const { data: uw } = await supabase
            .from("user_wallets")
            .select("balance_fcfa")
            .eq("user_id", w.user_id)
            .single();

          const refundedBal = Number(uw?.balance_fcfa || 0) + Number(w.amount);
          await supabase.from("user_wallets").update({ balance_fcfa: refundedBal }).eq("user_id", w.user_id);

          await supabase.from("wallet_transactions").insert({
            user_id: w.user_id,
            wallet_currency: "FCFA",
            type: "refund",
            amount: Number(w.amount),
            balance_after: refundedBal,
            reference_id: w.id,
            reference_type: "withdrawal",
            status: "completed",
            description: "Retrait Mobile Money échoué — remboursement",
          });
        }
      }

      return new Response("ok", { status: 200 });
    }

    // ========================================================
    // 2. TRANSACTION / PAYMENT (PAY-IN) EVENTS
    // ========================================================
    if (eventType === "transaction.success" || eventType === "payment.success" || data.status === "success") {
      // Find payment event
      let eventQuery = supabase.from("payment_events").select("*");
      if (transactionId) {
        eventQuery = eventQuery.or(`pawapay_deposit_id.eq.${transactionId},moneroo_transaction_id.eq.${reference}`);
      } else if (reference) {
        eventQuery = eventQuery.eq("moneroo_transaction_id", reference);
      }

      const { data: ev } = await eventQuery.maybeSingle();

      // Check if order already finalized
      let orderQuery = supabase.from("orders").select("id, status");
      if (transactionId) {
        orderQuery = orderQuery.or(`pawapay_deposit_id.eq.${transactionId},moneroo_transaction_id.eq.${reference}`);
      } else if (reference) {
        orderQuery = orderQuery.eq("moneroo_transaction_id", reference);
      }
      const { data: existingOrder } = await orderQuery.maybeSingle();

      if (existingOrder?.status === "completed") {
        return new Response("ok (already completed)", { status: 200 });
      }

      const grossAmount = amount || Number(ev?.amount || 0);
      // Dukaio takes 5% platform fee, seller receives 95%
      const netSeller = Math.round(grossAmount * 0.95);
      const dukaioCommission = grossAmount - netSeller;

      let orderId = existingOrder?.id;

      if (!orderId && ev) {
        // Create order
        const sessionParts = (ev.session_id || "").split("|");
        const customerEmail = sessionParts[0] || data.customer?.email || "";
        const customerId = sessionParts[1] || null;

        const { data: createdOrder, error: orderErr } = await supabase
          .from("orders")
          .insert({
            product_id: ev.product_id,
            store_owner_id: ev.store_owner_id,
            customer_id: customerId,
            amount: grossAmount,
            currency: "XOF",
            payment_provider: "saaspay",
            payment_method: data.payment_method || "mobile_money",
            pawapay_deposit_id: transactionId,
            moneroo_transaction_id: reference,
            status: "completed",
            funds_available_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          } as any)
          .select("id")
          .single();

        if (orderErr) {
          console.error("[saaspay-webhook] order creation error:", orderErr);
        } else {
          orderId = createdOrder?.id;
        }
      } else if (orderId) {
        await supabase
          .from("orders")
          .update({
            status: "completed",
            payment_provider: "saaspay",
            funds_available_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          })
          .eq("id", orderId);
      }

      // Update payment event to success
      if (ev?.id) {
        await supabase.from("payment_events").update({ status: "success" }).eq("id", ev.id);
      }

      // Credit seller wallet with 95%
      const storeOwnerId = ev?.store_owner_id;
      if (storeOwnerId) {
        await supabase.from("user_wallets").upsert({ user_id: storeOwnerId }, { onConflict: "user_id" });
        const { data: wallet } = await supabase
          .from("user_wallets")
          .select("pending_fcfa, balance_fcfa")
          .eq("user_id", storeOwnerId)
          .single();

        const currentPending = Number(wallet?.pending_fcfa || 0);
        await supabase
          .from("user_wallets")
          .update({ pending_fcfa: currentPending + netSeller })
          .eq("user_id", storeOwnerId);

        console.log(`[saaspay-webhook] credited seller ${storeOwnerId}: gross=${grossAmount}, dukaio(5%)=${dukaioCommission}, seller(95%)=${netSeller}`);
      }

      return new Response("ok (transaction completed)", { status: 200 });
    }

    if (eventType === "transaction.failed" || eventType === "transaction.cancelled") {
      if (transactionId || reference) {
        await supabase
          .from("payment_events")
          .update({ status: "failed" })
          .or(`pawapay_deposit_id.eq.${transactionId},moneroo_transaction_id.eq.${reference}`);
      }
      return new Response("ok (transaction failed recorded)", { status: 200 });
    }

    return new Response("ok (unhandled event)", { status: 200 });
  } catch (err: any) {
    console.error("[saaspay-webhook] fatal error:", err);
    return new Response(`Server error: ${err.message}`, { status: 500 });
  }
});

