// Stripe webhook: handles payment_intent.succeeded / failed -> credits wallet USD pending
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const whSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !whSecret) {
    return new Response("Stripe non configuré", { status: 500 });
  }
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig!, whSecret);
  } catch (err: any) {
    console.error("[stripe-webhook] sig error", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  console.log("[stripe-webhook] event", event.type);

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.order_id;
      const storeOwnerId = pi.metadata?.store_owner_id;
      if (!orderId || !storeOwnerId) return new Response("ok", { status: 200 });

      // Check idempotency
      const { data: order } = await supabase.from("orders")
        .select("id, amount, currency, status, store_owner_id, funds_available_at")
        .eq("id", orderId).maybeSingle();
      if (!order || order.status === "completed") return new Response("ok", { status: 200 });

      const amountUsd = Number(order.amount);
      const commission = amountUsd * 0.10;
      const net = amountUsd - commission;
      const availableAt = order.funds_available_at || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

      // Mark order completed
      await supabase.from("orders").update({ status: "completed" }).eq("id", orderId);

      // Ensure wallet row exists
      await supabase.from("user_wallets").upsert({ user_id: storeOwnerId }, { onConflict: "user_id" });

      // Credit pending_usd
      const { data: w } = await supabase.from("user_wallets")
        .select("pending_usd").eq("user_id", storeOwnerId).single();
      const newPending = Number(w?.pending_usd || 0) + net;
      await supabase.from("user_wallets")
        .update({ pending_usd: newPending })
        .eq("user_id", storeOwnerId);

      // Insert wallet transaction (pending until available_at)
      await supabase.from("wallet_transactions").insert({
        user_id: storeOwnerId,
        wallet_currency: "USD",
        type: "sale",
        amount: net,
        balance_after: newPending,
        reference_id: orderId,
        reference_type: "order",
        status: "pending",
        available_at: availableAt,
        description: `Vente Stripe (net après 10% commission)`,
      });
    }

    if (event.type === "payment_intent.payment_failed" || event.type === "payment_intent.canceled") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.order_id;
      if (orderId) await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
    }
  } catch (e: any) {
    console.error("[stripe-webhook] handler error", e);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
