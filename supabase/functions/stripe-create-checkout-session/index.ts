// Create a Stripe Checkout Session (hosted page) — redirect-based card payment
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return j({ error: "Stripe non configuré" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.json();
    const {
      amount_usd, product_id, product_title, store_owner_id,
      customer, shipping_address, promo_code, original_price,
      success_url, cancel_url, country,
    } = body;

    if (!amount_usd || amount_usd < 0.5) return j({ error: "Montant USD minimum 0.50" }, 400);
    if (!product_id || !store_owner_id) return j({ error: "Produit invalide" }, 400);
    if (!customer?.email || !customer?.name) return j({ error: "Client incomplet" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const email = customer.email.trim().toLowerCase();
    const { data: existing } = await supabase
      .from("customers").select("id").eq("email", email).maybeSingle();
    let customerId: string;
    if (existing?.id) {
      customerId = existing.id;
      await supabase.from("customers").update({
        name: customer.name, phone: customer.phone || "",
      }).eq("id", customerId);
    } else {
      const { data: created, error } = await supabase.from("customers")
        .insert({ email, name: customer.name, phone: customer.phone || "" })
        .select("id").single();
      if (error) return j({ error: error.message }, 400);
      customerId = created.id;
    }

    const fundsAvailableAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    const { data: order, error: ordErr } = await supabase
      .from("orders").insert({
        customer_id: customerId,
        product_id,
        store_owner_id,
        amount: amount_usd,
        currency: "USD",
        payment_provider: "stripe",
        status: "pending",
        promo_code: promo_code || null,
        original_amount: original_price || null,
        shipping_address: shipping_address || null,
        payment_method: "card",
        funds_available_at: fundsAvailableAt.toISOString(),
      } as any).select("id").single();
    if (ordErr) return j({ error: ordErr.message }, 400);

    const origin = req.headers.get("origin") || "";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(amount_usd) * 100),
          product_data: {
            name: product_title || "Dukaio",
            ...(customer.phone ? { description: `Client: ${customer.name}` } : {}),
          },
        },
        quantity: 1,
      }],
      success_url: success_url || `${origin}/payment-callback?order_id=${order.id}&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${origin}/payment-callback?order_id=${order.id}&provider=stripe&status=cancelled`,
      metadata: {
        order_id: order.id,
        product_id,
        store_owner_id,
        customer_id: customerId,
        ...(country ? { customer_country: country } : {}),
      },
      payment_intent_data: {
        metadata: {
          order_id: order.id,
          product_id,
          store_owner_id,
          customer_id: customerId,
        },
      },
    });

    await supabase.from("orders").update({
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
    }).eq("id", order.id);

    return j({ url: session.url, sessionId: session.id, orderId: order.id });
  } catch (err: any) {
    console.error("[stripe-create-checkout-session]", err);
    return j({ error: err.message }, 500);
  }

  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
