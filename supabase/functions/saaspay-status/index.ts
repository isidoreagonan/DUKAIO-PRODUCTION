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
    let orderQuery = supabase.from("orders").select("id, status, product_id, customer_id, store_owner_id, amount");
    if (paymentId) {
      orderQuery = orderQuery.or(`pawapay_deposit_id.eq.${paymentId},moneroo_transaction_id.eq.${paymentId}`);
    } else if (reference) {
      orderQuery = orderQuery.eq("moneroo_transaction_id", reference);
    }

    const { data: existingOrder } = await orderQuery.maybeSingle();

    if (existingOrder && existingOrder.status === "completed") {
      return json({ status: "success", orderId: existingOrder.id });
    }

    // 2. Query SaaSPay verify API
    let resolvedPaymentId = paymentId;

    // If client only has the reference (e.g. mobile data paused during USSD PIN prompt), lookup paymentId from payment_events
    if ((!resolvedPaymentId || resolvedPaymentId.startsWith("DK-")) && reference) {
      const { data: ev } = await supabase
        .from("payment_events")
        .select("pawapay_deposit_id, status")
        .eq("moneroo_transaction_id", reference)
        .maybeSingle();

      if (ev?.pawapay_deposit_id) {
        resolvedPaymentId = ev.pawapay_deposit_id;
      }
      if (ev?.status === "success" && existingOrder?.status === "completed") {
        return json({ status: "success", orderId: existingOrder.id });
      }
    }

    const apiKey = Deno.env.get("SAASPAY_SECRET_KEY");
    if (apiKey && resolvedPaymentId && !resolvedPaymentId.startsWith("DK-")) {
      try {
        // Try Softpay verify endpoint first
        let verifyRes = await fetch(`${SAASPAY_BASE_URL}/payments/${resolvedPaymentId}/verify/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        // If not found, try Checkout Sessions endpoint
        if (verifyRes.status === 404) {
          verifyRes = await fetch(`${SAASPAY_BASE_URL}/checkout-sessions/${resolvedPaymentId}/`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          });
        }

        // If not found, try Checkout Status endpoint
        if (verifyRes.status === 404) {
          verifyRes = await fetch(`${SAASPAY_BASE_URL}/checkout/${resolvedPaymentId}/status/`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          });
        }

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          const txn = verifyData.data || verifyData;
          const rawStatus = String(txn.status || verifyData.status || "").toUpperCase();

          console.log(`[saaspay-status] id=${paymentId} rawStatus=${rawStatus}`);

          if (rawStatus === "SUCCESS" || rawStatus === "COMPLETED" || rawStatus === "PAID") {
            let orderId = existingOrder?.id;
            let grossAmount = 0;
            let sellerId: string | null = null;

            if (existingOrder) {
              // Existing pending order! Finalize it now
              grossAmount = Number(existingOrder.amount || txn.requested_amount || txn.amount || 0);
              sellerId = (existingOrder as any).store_owner_id;

              await supabase
                .from("orders")
                .update({
                  status: "completed",
                  payment_provider: "saaspay",
                  funds_available_at: new Date().toISOString(), // 0-minute hold
                })
                .eq("id", existingOrder.id);
            } else {
              // Create new order from payment event
              const { data: ev } = await supabase
                .from("payment_events")
                .select("*")
                .or(`pawapay_deposit_id.eq.${resolvedPaymentId},moneroo_transaction_id.eq.${reference}`)
                .maybeSingle();

              if (ev) {
                grossAmount = Number(ev.amount || txn.requested_amount || txn.amount || 0);
                sellerId = ev.store_owner_id;
                const sessionParts = (ev.session_id || "").split("|");
                const customerId = sessionParts[1] || null;

                const { data: newOrder } = await supabase
                  .from("orders")
                  .insert({
                    product_id: ev.product_id,
                    store_owner_id: ev.store_owner_id,
                    customer_id: customerId,
                    amount: grossAmount,
                    currency: "XOF",
                    payment_provider: "saaspay",
                    payment_method: txn.network_code || "mobile_money",
                    pawapay_deposit_id: resolvedPaymentId,
                    moneroo_transaction_id: reference || txn.reference,
                    status: "completed",
                    funds_available_at: new Date().toISOString(), // 0-minute hold
                  } as any)
                  .select("id")
                  .single();

                orderId = newOrder?.id;
              }
            }

            // Update payment event to success
            await supabase
              .from("payment_events")
              .update({ status: "success" })
              .or(`pawapay_deposit_id.eq.${resolvedPaymentId},moneroo_transaction_id.eq.${reference}`);

            // Credit seller wallet with 95% immediately (0-minute hold)
            if (sellerId && grossAmount > 0) {
              const netSeller = Math.round(grossAmount * 0.95);
              await supabase.from("user_wallets").upsert({ user_id: sellerId }, { onConflict: "user_id" });
              const { data: w } = await supabase
                .from("user_wallets")
                .select("balance_fcfa")
                .eq("user_id", sellerId)
                .single();
              const currentBal = Number(w?.balance_fcfa || 0);
              const newBal = currentBal + netSeller;
              await supabase
                .from("user_wallets")
                .update({ balance_fcfa: newBal })
                .eq("user_id", sellerId);

              await supabase.from("wallet_transactions").insert({
                user_id: sellerId,
                wallet_currency: "XOF",
                type: "sale",
                amount: netSeller,
                balance_after: newBal,
                reference_id: orderId,
                reference_type: "order",
                status: "completed",
                available_at: new Date().toISOString(),
                description: `Vente produit (${grossAmount} FCFA brut — net 95% après commission 5% DUKAIO)`,
              });

              await supabase.from("notifications").insert({
                user_id: sellerId,
                title: "Paiement validé avec succès !",
                message: `Paiement de ${grossAmount} FCFA reçu (+${netSeller} FCFA net ajoutés à votre portefeuille disponible immédiatement).`,
                type: "success",
              });
            }

            return json({ status: "success", orderId });
          } else if (
            rawStatus === "FAILED" ||
            rawStatus === "REJECTED" ||
            rawStatus === "CANCELLED" ||
            rawStatus === "CANCELED" ||
            rawStatus === "EXPIRED" ||
            rawStatus === "REFUSED"
          ) {
            // Update order to failed so it reflects in Dashboard
            await supabase
              .from("orders")
              .update({ status: "failed" })
              .or(`pawapay_deposit_id.eq.${paymentId},moneroo_transaction_id.eq.${reference}`);

            // Update payment event to failed
            await supabase
              .from("payment_events")
              .update({ status: "failed" })
              .or(`pawapay_deposit_id.eq.${paymentId},moneroo_transaction_id.eq.${reference}`);

            const errMsg =
              rawStatus === "CANCELLED" || rawStatus === "CANCELED"
                ? "Paiement annulé depuis votre téléphone."
                : rawStatus === "EXPIRED"
                ? "Le délai de validation sur votre téléphone a expiré."
                : txn.failure_reason || "Paiement refusé ou annulé sur votre téléphone.";

            return json({ status: "failed", error: errMsg });
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

