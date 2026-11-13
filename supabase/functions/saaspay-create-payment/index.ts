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
    // DUKAIO products are priced in FCFA (XOF).
    // Passing currency: "XOF" ensures SaaSPay's official FX engine converts to local currency (NGN, ZMW, KES, etc.) at the official central bank exchange rate without loss.
    const currency = "XOF";

    // Track payment event in database
    const { data: paymentEvent, error: eventErr } = await supabase
      .from("payment_events")
      .insert({
        amount: Number(body.amount),
        product_id: body.metadata.product_id,
        store_owner_id: body.metadata.store_owner_id,
        session_id: `${email}|${customerId}|${reference}|${body.metadata.promo_code || ""}|${body.metadata.original_price || body.amount}`,
        status: "pending",
      })
      .select("id")
      .single();

    if (eventErr) console.error("payment_events insert warning:", eventErr);

    const countryUpper = (body.country || "BJ").toUpperCase();
    const rawMethod = String(body.method || "mtn").toLowerCase();
    const isCardOrCrypto = rawMethod === "card" || rawMethod === "crypto";

    // Split customer name
    const nameParts = name.split(" ").filter(Boolean);
    const firstName = nameParts[0] || "Client";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    // Detect country dial code and parse local phone number
    const dialCodeMap: Record<string, string> = {
      BJ: "229", CI: "225", SN: "221", TG: "228", CM: "237",
      BF: "226", ML: "223", GA: "241", CG: "242", CD: "243",
      NE: "227", GN: "224", NG: "234", GH: "233", FR: "33", US: "1", CA: "1", BE: "32",
    };
    const dialCode = dialCodeMap[countryUpper] || "";
    let localPhone = rawPhone;
    if (dialCode && localPhone.startsWith(dialCode)) {
      localPhone = localPhone.slice(dialCode.length);
    }
    // Benin: Ensure 10 digits (older numbers were 8 digits, new format adds 01 prefix)
    if (countryUpper === "BJ" && localPhone.length === 8) {
      localPhone = `01${localPhone}`;
    }
    // Nigeria: Strip leading 0 if present (e.g. 080 -> 80)
    if (countryUpper === "NG" && localPhone.startsWith("0")) {
      localPhone = localPhone.slice(1);
    }

    // Determine normalized SaaSPay network code
    let networkCode = rawMethod;
    if (!networkCode.includes("_") && !isCardOrCrypto) {
      networkCode = `${networkCode}_${countryUpper.toLowerCase()}`;
    }

    // For Nigeria: All local mobile (MTN, Airtel) and bank options route through dynamic virtual bank transfer
    const isNigerianBank = (countryUpper === "NG" && !isCardOrCrypto) || networkCode === "allbanks_ng" || networkCode.includes("bank");

    let saaspayData: any = null;
    let paymentId = "";
    let checkoutUrl = "";
    let checkoutSlug = "";
    let bankTransfer: any = null;

    if (isCardOrCrypto || isNigerianBank) {
      // SaaSPay Checkout Sessions (Card, Crypto & Nigerian Bank Transfer)
      const sessionPayload = {
        amount: amountFormatted,
        currency,
        country: countryUpper,
        payment_method: isNigerianBank ? "bank_transfer" : (body.method === "crypto" ? "crypto" : "card"),
        customer_name: name,
        customer_email: email,
        customer_phone: rawPhone ? `+${rawPhone}` : undefined,
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
        const errDetail =
          saaspayData?.error?.message ||
          (typeof saaspayData?.error === "string" ? saaspayData.error : null) ||
          saaspayData?.detail ||
          saaspayData?.message ||
          "Erreur initialisation session de paiement";
        return json({ error: errDetail }, res.status);
      }

      const sessionObj = saaspayData.data || saaspayData;
      checkoutSlug = sessionObj.slug || sessionObj.id || "";
      paymentId = checkoutSlug || reference;
      checkoutUrl = sessionObj.checkout_url || "";

      // If Nigerian bank transfer, trigger /checkout/{slug}/pay/ to retrieve dynamic virtual account
      if (isNigerianBank && checkoutSlug) {
        try {
          console.log(`[saaspay-create-payment] fetching dynamic bank transfer details for slug: ${checkoutSlug}`);
          const payRes = await fetch(`${SAASPAY_BASE_URL}/checkout/${checkoutSlug}/pay/`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              country: "NG",
              network: "allbanks_ng",
              customer: {
                first_name: firstName,
                last_name: lastName,
                email,
                phone: rawPhone ? `+${rawPhone}` : undefined,
              },
            }),
          });

          const payData = await payRes.json();
          console.log("[saaspay-checkout-pay] response:", payRes.status, JSON.stringify(payData));

          if (payRes.ok && (payData.data?.bank_transfer || payData.bank_transfer)) {
            bankTransfer = payData.data?.bank_transfer || payData.bank_transfer;
          }
        } catch (payErr) {
          console.warn("[saaspay-create-payment] pay endpoint warning:", payErr);
        }
      }
    } else {
      // SaaSPay Softpay (Mobile Money Direct Push USSD)
      const softpayPayload = {
        amount: amountFormatted,
        currency,
        country: countryUpper,
        network: networkCode,
        phone_number: localPhone,
        customer: {
          first_name: firstName,
          last_name: lastName,
          email,
          phone: localPhone,
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
        const errDetail =
          saaspayData?.error?.message ||
          (typeof saaspayData?.error === "string" ? saaspayData.error : null) ||
          saaspayData?.detail ||
          saaspayData?.message ||
          "Erreur déclenchement paiement Mobile Money";
        return json({ error: errDetail }, res.status);
      }

      const softpayObj = saaspayData.data || saaspayData;
      paymentId = softpayObj.id || softpayObj.payment_id || reference;
      checkoutUrl = softpayObj.checkout_url || "";
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

    // Create pending order record so it is immediately visible in Dashboard (sales, revenues, clients, admin)
    let orderId: string | null = null;
    try {
      const { data: createdOrder, error: orderErr } = await supabase
        .from("orders")
        .insert({
          amount: Number(body.amount),
          currency,
          customer_id: customerId,
          product_id: body.metadata.product_id,
          store_owner_id: body.metadata.store_owner_id,
          status: "pending",
          payment_provider: "saaspay",
          payment_method: isCardOrCrypto ? (body.method === "crypto" ? "crypto" : "card") : networkCode,
          pawapay_deposit_id: paymentId,
          moneroo_transaction_id: reference,
          promo_code: body.metadata.promo_code || null,
          original_amount: body.metadata.original_price ? Number(body.metadata.original_price) : null,
          shipping_address: body.metadata.shipping_address || null,
        } as any)
        .select("id")
        .single();

      if (orderErr) {
        console.warn("[saaspay-create-payment] order insert warning:", orderErr);
      } else {
        orderId = createdOrder?.id || null;
      }
    } catch (orderCatch) {
      console.warn("[saaspay-create-payment] order insert exception:", orderCatch);
    }

    return json({
      success: true,
      paymentId,
      reference,
      orderId,
      checkoutUrl,
      checkoutSlug,
      bankTransfer,
      directPush: !checkoutUrl && !bankTransfer,
      status: saaspayData.status || "pending",
    });
  } catch (err: any) {
    console.error("[saaspay-create-payment] fatal error:", err);
    return json({ error: err.message || "Erreur interne serveur" }, 500);
  }
});

