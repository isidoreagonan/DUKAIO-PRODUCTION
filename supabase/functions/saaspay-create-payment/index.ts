// SaaSPay create payment (pay-in) initiation
// Supports Mobile Money (direct USSD push via Softpay) and Cards/Crypto via Checkout Session
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SAASPAY_BASE_URL = Deno.env.get("SAASPAY_BASE_URL") || "https://api.saspay.me/api/v1";

interface CreatePaymentBody {
  amount: number;
  currency?: string;
  country: string; // ISO 2 code: BJ, CI, SN, TG, BF, ML, CM, etc.
  method: string;  // mtn_bj, moov_bj, orange_ci, wave_ci, card, crypto, etc.
  phone: string;   // international without + or local
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  metadata: {
    product_id: string;
    product_title?: string;
    store_owner_id: string;
    promo_code?: string | null;
    original_price?: number | null;
    shipping_address?: any;
    return_url?: string;
    cancel_url?: string;
  };
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("SAASPAY_SECRET_KEY");
    if (!apiKey) {
      return json({ error: "SaaSPay secret key non configurée" }, 500);
    }

    const body = (await req.json()) as CreatePaymentBody;

    // Validation
    if (!body.amount || body.amount <= 0) return json({ error: "Montant invalide" }, 400);
    if (!body.country) return json({ error: "Pays requis" }, 400);
    if (!body.method) return json({ error: "Méthode de paiement requise" }, 400);
    if (!body.customer?.email || !body.customer?.name) return json({ error: "Nom et email client requis" }, 400);
    if (!body.metadata?.product_id || !body.metadata?.store_owner_id) {
      return json({ error: "Données produit et vendeur manquantes" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert customer in database
    const email = body.customer.email.trim().toLowerCase();
    const name = body.customer.name.trim();
    const rawPhone = (body.phone || body.customer.phone || "").replace(/\D/g, "");

    let customerId: string;
    const { data: existingCust } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingCust?.id) {
      customerId = existingCust.id;
      if (name || rawPhone) {
        await supabase
          .from("customers")
          .update({ name, phone: rawPhone ? `+${rawPhone}` : undefined })
          .eq("id", customerId);
      }
    } else {
      const { data: createdCust, error: custErr } = await supabase
        .from("customers")
        .insert({ email, name, phone: rawPhone ? `+${rawPhone}` : "" })
        .select("id")
        .single();
      if (custErr) return json({ error: `Client: ${custErr.message}` }, 400);
      customerId = createdCust.id;
    }

    // Generate unique reference
    const reference = `DK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const amountFormatted = Math.round(Number(body.amount)).toFixed(2);
    const currency = body.currency || "XOF";

    // Track payment event in database
    const { data: paymentEvent, error: eventErr } = await supabase
      .from("payment_events")
      .insert({
        amount: Number(body.amount),
        product_id: body.metadata.product_id,
        store_owner_id: body.metadata.store_owner_id,
        session_id: `${email}|${customerId}|${reference}`,
        status: "pending",
      })
      .select("id")
      .single();

    if (eventErr) console.error("payment_events insert warning:", eventErr);

    const isCardOrCrypto = body.method === "card" || body.method === "crypto";

    let saaspayData: any = null;
    let paymentId = "";
    let checkoutUrl = "";

    if (isCardOrCrypto) {
      // Use SaaSPay Checkout Session for 3D-Secure Cards & Blockchain Cryptos
      const sessionPayload = {
        amount: amountFormatted,
        currency,
        country: body.country.toUpperCase(),
        payment_method: body.method === "crypto" ? "crypto" : "card",
        customer: {
          name,
          email,
          phone: rawPhone ? `+${rawPhone}` : undefined,
        },
        reference,
        fee_charge_mode: "ADD_ON",
        return_url: body.metadata.return_url || "https://dukaio.com/payment-callback?ref=" + reference,
        cancel_url: body.metadata.cancel_url || "https://dukaio.com",
      };

      console.log("[saaspay-checkout-session] request:", JSON.stringify(sessionPayload));

      const res = await fetch(`${SAASPAY_BASE_URL}/checkout-sessions/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionPayload),
      });

      saaspayData = await res.json();
      console.log("[saaspay-checkout-session] response:", res.status, JSON.stringify(saaspayData));

      if (!res.ok) {
        return json({ error: saaspayData?.detail || saaspayData?.message || "Erreur initialisation session de paiement" }, res.status);
      }

      paymentId = saaspayData.id || saaspayData.session_id || reference;
      checkoutUrl = saaspayData.checkout_url || "";
    } else {
      // Use SaaSPay Softpay Direct Push USSD for Mobile Money
      const softpayPayload = {
        amount: amountFormatted,
        currency,
        country: body.country.toUpperCase(),
        payment_method: body.method.toLowerCase(),
        phone_number: rawPhone,
        customer: {
          name,
          email,
          phone: rawPhone ? `+${rawPhone}` : undefined,
        },
        reference,
        fee_charge_mode: "ADD_ON",
        return_url: body.metadata.return_url || "https://dukaio.com/payment-callback?ref=" + reference,
        cancel_url: body.metadata.cancel_url || "https://dukaio.com",
      };

      console.log("[saaspay-softpay] request:", JSON.stringify(softpayPayload));

      const res = await fetch(`${SAASPAY_BASE_URL}/payments/softpay/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(softpayPayload),
      });

      saaspayData = await res.json();
      console.log("[saaspay-softpay] response:", res.status, JSON.stringify(saaspayData));

      if (!res.ok) {
        return json({ error: saaspayData?.detail || saaspayData?.message || "Erreur déclenchement paiement Mobile Money" }, res.status);
      }

      paymentId = saaspayData.id || saaspayData.payment_id || reference;
      checkoutUrl = saaspayData.checkout_url || "";
    }

    // Update payment event with SaaSPay transaction ID
    if (paymentEvent?.id && paymentId) {
      await supabase
        .from("payment_events")
        .update({
          pawapay_deposit_id: paymentId, // re-used as transaction reference
          moneroo_transaction_id: reference,
        })
        .eq("id", paymentEvent.id);
    }

    return json({
      success: true,
      paymentId,
      reference,
      checkoutUrl,
      directPush: !checkoutUrl, // if no checkout_url, user received USSD prompt on phone
      status: saaspayData.status || "pending",
    });
  } catch (err: any) {
    console.error("[saaspay-create-payment] fatal error:", err);
    return json({ error: err.message || "Erreur interne serveur" }, 500);
  }
});

