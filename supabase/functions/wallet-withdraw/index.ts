// Withdraw from FCFA wallet via SaaSPay payout (with fallback to manual / PawaPay)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SAASPAY_BASE_URL = Deno.env.get("SAASPAY_BASE_URL") || "https://api.saspay.me/api/v1";
const PAWAPAY_BASE = "https://api.pawapay.io";

// Accurate currency mapping for every African & international payout country
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  BJ: "XOF", CI: "XOF", SN: "XOF", TG: "XOF", BF: "XOF", ML: "XOF", NE: "XOF",
  CM: "XAF", GA: "XAF", CG: "XAF", CD: "CDF",
  NG: "NGN", GH: "GHS", GN: "GNF", KE: "KES", RW: "RWF", UG: "UGX",
  TZ: "TZS", ZM: "ZMW", MW: "MWK", MZ: "MZN", SL: "SLL",
  US: "USD", IN: "INR",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const saaspayKey = Deno.env.get("SAASPAY_SECRET_KEY");
    const pawapayToken = Deno.env.get("PAWAPAY_API_TOKEN");

    if (!saaspayKey && !pawapayToken) return j({ error: "Aucun prestataire de paiement configuré" }, 500);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Non authentifié" }, 401);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return j({ error: "Non authentifié" }, 401);

    const { amount, phone, provider, country } = await req.json();
    if (!amount || amount < 100) return j({ error: "Montant minimum 100 FCFA" }, 400);
    if (!phone || !provider) return j({ error: "Numéro et opérateur requis" }, 400);

    // Check FCFA balance
    const { data: wallet } = await service.from("user_wallets")
      .select("balance_fcfa").eq("user_id", user.id).maybeSingle();
    const available = Number(wallet?.balance_fcfa || 0);
    if (amount > available) {
      return j({ error: `Solde FCFA insuffisant. Disponible: ${Math.floor(available)} FCFA` }, 400);
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;

    // Debit wallet first
    const newBalance = available - amount;
    await service.from("user_wallets").update({ balance_fcfa: newBalance }).eq("user_id", user.id);

    const providerCode = String(provider).toLowerCase();
    const operatorName = providerCode.split("_")[0];
    const countryCode = (country || providerCode.split("_")[1] || "BJ").toUpperCase();

    // Create withdrawal record
    const { data: withdrawal, error: insErr } = await service.from("withdrawals").insert({
      user_id: user.id,
      amount, fee: 0, net_amount: amount,
      phone_number: formattedPhone,
      operator: operatorName,
      provider_code: providerCode,
      payment_provider: saaspayKey ? "saaspay" : "pawapay",
      status: "processing",
    } as any).select().single();

    if (insErr) {
      // Refund
      await service.from("user_wallets").update({ balance_fcfa: available }).eq("user_id", user.id);
      return j({ error: insErr.message }, 400);
    }

    // Log transaction
    await service.from("wallet_transactions").insert({
      user_id: user.id, wallet_currency: "FCFA", type: "withdrawal",
      amount: -amount, balance_after: newBalance,
      reference_id: withdrawal.id, reference_type: "withdrawal",
      status: "completed",
      description: `Retrait Mobile Money vers ${formattedPhone}`,
    });

    // -------------------------------------------------------------
    // OPTION A: SAASPAY PAYOUT (Live African & Worldwide Networks)
    // -------------------------------------------------------------
    if (saaspayKey) {
      let currency = COUNTRY_CURRENCY_MAP[countryCode] || "XOF";
      if (providerCode.includes("usd")) {
        currency = "USD";
      }

      // Fetch user profile for required Customer details in SaaSPay
      const { data: profile } = await service.from("profiles")
        .select("first_name, last_name, display_name, phone")
        .eq("id", user.id)
        .maybeSingle();

      const firstName = profile?.first_name || profile?.display_name?.split(" ")[0] || "Créateur";
      const lastName = profile?.last_name || profile?.display_name?.split(" ").slice(1).join(" ") || "Dukaio";

      const idempotencyKey = `payout-${withdrawal.id}-${Date.now()}`;
      const payload = {
        amount: Math.round(amount).toFixed(2),
        currency: currency,
        country: countryCode,
        method: providerCode, // Exact SaaSPay network code (e.g. celtiis_bj, mtn_bj, wave_ci, mixx_tg, allbanks_ng)
        recipient: { msisdn: formattedPhone },
        customer: {
          email: user.email || "creator@dukaio.com",
          first_name: firstName,
          last_name: lastName,
          phone: formattedPhone,
        },
        description: `Retrait DUKAIO #${withdrawal.id.slice(0, 8).toUpperCase()}`,
        fee_charge_mode: "ADD_ON",
      };

      console.log("[wallet-withdraw -> saaspay] payload:", JSON.stringify(payload));

      try {
        const resp = await fetch(`${SAASPAY_BASE_URL}/payouts/initialize/`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${saaspayKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify(payload),
        });

        const data = await resp.json();
        console.log("[wallet-withdraw -> saaspay] response:", resp.status, JSON.stringify(data));

        if (resp.ok && (data.id || data.payout_id || data.status === "success" || data.status === "processing")) {
          const payoutId = data.id || data.payout_id || idempotencyKey;
          await service.from("withdrawals").update({
            pawapay_payout_id: payoutId,
            status: "processing",
          }).eq("id", withdrawal.id);

          await service.from("notifications").insert({
            user_id: user.id,
            title: "Demande de retrait en cours",
            message: `Votre virement de ${amount} FCFA vers ${formattedPhone} (${providerCode.toUpperCase()}) est en cours de traitement via SaaSPay.`,
            type: "info",
          });

          return j({ success: true, withdrawal_id: withdrawal.id, status: "processing" });
        } else {
          // If SaaSPay reports IP whitelisting or needs manual approval
          const isIpBlock = data?.error?.code === "ip_not_whitelisted" || resp.status === 403;
          console.warn("[wallet-withdraw -> saaspay] status pending/queue:", data);

          await service.from("withdrawals").update({
            status: "pending",
            notes: isIpBlock ? "IP en attente de whitelist dans SaaSPay" : (data?.error?.message || "En cours de traitement"),
          } as any).eq("id", withdrawal.id);

          await service.from("notifications").insert({
            user_id: user.id,
            title: "Retrait enregistré",
            message: `Votre demande de retrait de ${amount} FCFA vers ${formattedPhone} a été prise en compte et est en cours d'exécution.`,
            type: "info",
          });

          return j({ success: true, withdrawal_id: withdrawal.id, status: "pending_manual" });
        }
      } catch (err: any) {
        console.error("[wallet-withdraw -> saaspay error]", err);
        await service.from("withdrawals").update({ status: "pending" }).eq("id", withdrawal.id);
        return j({ success: true, withdrawal_id: withdrawal.id, status: "pending_manual" });
      }
    }

    // -------------------------------------------------------------
    // OPTION B: PAWAPAY PAYOUT (Fallback)
    // -------------------------------------------------------------
    const payoutId = crypto.randomUUID();
    const payload = {
      payoutId, amount: Math.round(amount).toString(), currency: "XOF",
      recipient: { type: "MMO", accountDetails: { phoneNumber: cleanPhone, provider } },
      customerMessage: "Dukaio retrait".slice(0, 22),
      metadata: [{ withdrawal_id: withdrawal.id }, { user_id: user.id }],
    };

    const resp = await fetch(`${PAWAPAY_BASE}/v2/payouts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${pawapayToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    console.log("[wallet-withdraw -> pawapay]", resp.status, JSON.stringify(data).slice(0, 300));

    if (!resp.ok || data.status === "REJECTED" || data.status === "FAILED") {
      await service.from("withdrawals").update({ status: "pending" }).eq("id", withdrawal.id);
      await service.from("notifications").insert({
        user_id: user.id, title: "Retrait en traitement",
        message: `Votre retrait de ${amount} FCFA vers ${formattedPhone} est en cours de validation.`,
        type: "info",
      });
      return j({ success: true, withdrawal_id: withdrawal.id, status: "pending_manual" });
    }

    await service.from("withdrawals").update({ pawapay_payout_id: payoutId }).eq("id", withdrawal.id);
    await service.from("notifications").insert({
      user_id: user.id, title: "Demande de retrait",
      message: `Votre retrait de ${amount} FCFA vers ${formattedPhone} est en cours.`,
      type: "info",
    });

    return j({ success: true, withdrawal_id: withdrawal.id, status: data.status });
  } catch (err: any) {
    console.error("[wallet-withdraw]", err);
    return j({ error: err.message }, 500);
  }

  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
