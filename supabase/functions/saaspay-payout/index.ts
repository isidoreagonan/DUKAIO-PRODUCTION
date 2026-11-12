// SaaSPay payout (vendor withdrawal) via POST /api/v1/payouts/initialize/
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SAASPAY_BASE_URL = Deno.env.get("SAASPAY_BASE_URL") || "https://api.saspay.me/api/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("SAASPAY_SECRET_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "SaaSPay secret key manquante" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { withdrawalId } = await req.json();
    if (!withdrawalId) {
      return new Response(JSON.stringify({ error: "withdrawalId requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: w, error: wErr } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single();

    if (wErr || !w) {
      return new Response(JSON.stringify({ error: "Retrait introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountFormatted = Math.round(Number(w.amount)).toFixed(2);
    const rawPhone = (w.phone_number || "").replace(/\D/g, "");
    const idempotencyKey = `payout-${w.id}-${Date.now()}`;

    const providerCode = String(w.provider_code || "").toLowerCase();
    const operator = String(w.operator || "").toLowerCase();
    let method = "mtn_bj";
    let countryCode = "BJ";

    if (providerCode.includes("_")) {
      method = providerCode;
      countryCode = providerCode.split("_")[1].toUpperCase();
    } else if (operator) {
      countryCode = "BJ";
      method = `${operator}_bj`;
    }

    // SaaSPay Payout initialization payload
    const payload = {
      amount: amountFormatted,
      currency: "XOF",
      country: countryCode,
      payment_method: method,
      recipient: {
        msisdn: rawPhone,
      },
      reference: `RETRAIT-${w.id.slice(0, 8).toUpperCase()}`,
    };

    console.log("[saaspay-payout] request:", JSON.stringify(payload));

    const res = await fetch(`${SAASPAY_BASE_URL}/payouts/initialize/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("[saaspay-payout] response:", res.status, JSON.stringify(data));

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.detail || data?.message || "Erreur SaaSPay Payout" }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payoutId = data.id || data.payout_id || idempotencyKey;

    await supabase.from("withdrawals").update({
      pawapay_payout_id: payoutId,
      status: "processing",
    }).eq("id", w.id);

    return new Response(JSON.stringify({ success: true, payoutId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[saaspay-payout] fatal error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

