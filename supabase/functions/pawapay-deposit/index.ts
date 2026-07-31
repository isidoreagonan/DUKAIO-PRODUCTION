// PawaPay deposit (pay-in) initiation
// Docs: https://docs.pawapay.io/v2/api-reference/deposits
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAWAPAY_BASE = "https://api.pawapay.io";

interface DepositBody {
  amount: number;
  currency: string;
  provider: string; // e.g. MTN_MOMO_BEN
  phone: string; // full international, no +
  customer: { name: string; email: string };
  metadata: {
    product_id: string;
    product_title?: string;
    store_owner_id: string;
    promo_code?: string | null;
    original_price?: number | null;
    shipping_address?: any;
    session_id?: string | null;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = Deno.env.get("PAWAPAY_API_TOKEN");
    if (!token) {
      return json({ error: "PawaPay token non configuré" }, 500);
    }

    const body = (await req.json()) as DepositBody;

    // Validate
    if (!body.amount || body.amount <= 0) return json({ error: "Montant invalide" }, 400);
    if (!body.provider) return json({ error: "Opérateur requis" }, 400);
    if (!body.phone || body.phone.length < 8) return json({ error: "Numéro invalide" }, 400);
    if (!body.customer?.email || !body.customer?.name) return json({ error: "Client incomplet" }, 400);
    if (!body.metadata?.product_id || !body.metadata?.store_owner_id)
      return json({ error: "Produit requis" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Upsert customer
    const email = body.customer.email.trim().toLowerCase();
    const name = body.customer.name.trim();
    const phone = body.phone.replace(/\D/g, "");

    let customerId: string;
    const { data: existing } = await admin
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing?.id) {
      customerId = existing.id;
      await admin.from("customers").update({ name, phone: `+${phone}` }).eq("id", customerId);
    } else {
      const { data: created, error: createErr } = await admin
        .from("customers")
        .insert({ email, name, phone: `+${phone}` })
        .select("id")
        .single();
      if (createErr) return json({ error: `Client: ${createErr.message}` }, 400);
      customerId = created.id;
    }

    const depositId = crypto.randomUUID();
    const amountStr = Math.round(Number(body.amount)).toString();

    // Build customer message (max 22 chars, alphanumeric+space)
    const rawMsg = (body.metadata.product_title || "Achat Dukaio").replace(/[^A-Za-z0-9 ]/g, "");
    const statementDescription = rawMsg.slice(0, 22) || "Dukaio";

    const payload = {
      depositId,
      amount: amountStr,
      currency: body.currency,
      payer: {
        type: "MMO",
        accountDetails: {
          phoneNumber: phone,
          provider: body.provider,
        },
      },
      customerMessage: statementDescription,
      metadata: [
        { customer_id: customerId },
        { product_id: body.metadata.product_id },
        { store_owner_id: body.metadata.store_owner_id },
        ...(body.metadata.promo_code
          ? [{ promo_code: String(body.metadata.promo_code) }]
          : []),
        ...(body.metadata.original_price
          ? [{ original_price: String(body.metadata.original_price) }]
          : []),
        ...(body.metadata.shipping_address
          ? [{ shipping_address: JSON.stringify(body.metadata.shipping_address) }]
          : []),
      ],
    };

    console.log("[pawapay-deposit] init", depositId, body.provider, amountStr, body.currency);

    const resp = await fetch(`${PAWAPAY_BASE}/v2/deposits`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    console.log("[pawapay-deposit] response", resp.status, JSON.stringify(data));

    if (!resp.ok || data.status === "REJECTED" || data.status === "FAILED") {
      const reason =
        data?.failureReason?.failureMessage ||
        data?.rejectionReason?.rejectionMessage ||
        "Erreur PawaPay";
      return json({ error: reason }, 400);
    }

    // Save payment_event for realtime tracking
    await admin.from("payment_events").insert({
      store_owner_id: body.metadata.store_owner_id,
      product_id: body.metadata.product_id,
      amount: Math.round(Number(body.amount)),
      status: "initiated",
      session_id: body.metadata.session_id || null,
      pawapay_deposit_id: depositId,
    });

    return json({
      depositId,
      status: data.status, // ACCEPTED | ENQUEUED | COMPLETED ...
      currency: body.currency,
      amount: amountStr,
    });
  } catch (err: any) {
    console.error("[pawapay-deposit] error", err);
    return json({ error: err.message || "Erreur serveur" }, 500);
  }

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
