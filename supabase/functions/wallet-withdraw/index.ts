// Withdraw from FCFA wallet via SaaSPay payout (routed through Vercel Node.js Webshare static IP relay)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SAASPAY_BASE_URL = Deno.env.get("SAASPAY_BASE_URL") || "https://api.saspay.me/api/v1";
const PAWAPAY_BASE = "https://api.pawapay.io";
const DEFAULT_RELAY_URL = "https://ecom-revolt.com/api/saaspay-payout-relay";

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

  let debited = false;
  let availableBalance = 0;
  let createdWithdrawalId: string | null = null;
  let currentUserId: string | null = null;
  let currentService: any = null;

  try {
    const saaspayKey = Deno.env.get("SAASPAY_SECRET_KEY");
    const pawapayToken = Deno.env.get("PAWAPAY_API_TOKEN");

    if (!saaspayKey && !pawapayToken) return j({ error: "Aucun prestataire de paiement configuré" }, 500);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    currentService = service;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Non authentifié" }, 401);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return j({ error: "Non authentifié" }, 401);
    currentUserId = user.id;

    const { amount, phone, provider, country } = await req.json();

    // Enforce mandatory KYC verification before any withdrawal (except for platform admin)
    const ADMIN_EMAILS = [
      "isidoreagonan@gmail.com",
      "dolapoagonan@gmail.com",
    ];
    const isAdmin = ADMIN_EMAILS.includes((user.email || "").toLowerCase().trim());

    if (!isAdmin) {
      const { data: kycRecord } = await service
        .from("identity_verifications")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (kycRecord?.status !== "approved") {
        return j({
          error: "Vérification d'identité (KYC) requise avant tout retrait. Veuillez soumettre votre pièce d'identité dans votre espace KYC.",
          code: "kyc_required",
          kyc_status: kycRecord?.status || "none",
        }, 403);
      }
    }
    
    // SaaSPay minimum withdrawal is 200 FCFA
    if (!amount || amount < 200) return j({ error: "Montant minimum de retrait : 200 FCFA" }, 400);
    if (!phone || !provider) return j({ error: "Numéro et opérateur requis" }, 400);

    // Check FCFA balance
    const { data: wallet } = await service.from("user_wallets")
      .select("balance_fcfa").eq("user_id", user.id).maybeSingle();
    let available = Number(wallet?.balance_fcfa || 0);

    // Self-healing: if available in user_wallets is less than requested amount,
    // recalculate actual net earned from completed orders minus genuinely completed withdrawals
    if (available < amount) {
      const { data: completedOrders } = await service
        .from("orders")
        .select("amount")
        .eq("store_owner_id", user.id)
        .eq("status", "completed");

      const totalEarnedNet = (completedOrders || []).reduce(
        (sum, o) => sum + Math.round(Number(o.amount || 0) * 0.95),
        0
      );

      const { data: completedWithdrawals } = await service
        .from("withdrawals")
        .select("amount")
        .eq("user_id", user.id)
        .eq("status", "completed");

      const totalDisbursed = (completedWithdrawals || []).reduce(
        (sum, w) => sum + Number(w.amount || 0),
        0
      );

      const realAvailable = Math.max(0, totalEarnedNet - totalDisbursed);
      if (realAvailable > available) {
        available = realAvailable;
        await service.from("user_wallets").upsert({
          user_id: user.id,
          balance_fcfa: available,
          pending_fcfa: 0,
        }, { onConflict: "user_id" });
      }
    }

    if (amount > available) {
      return j({ error: `Solde FCFA insuffisant. Disponible: ${Math.floor(available)} FCFA` }, 400);
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;

    // Debit wallet first
    availableBalance = available;
    const newBalance = available - amount;
    await service.from("user_wallets").update({ balance_fcfa: newBalance }).eq("user_id", user.id);
    debited = true;

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
    createdWithdrawalId = withdrawal.id;

    // -------------------------------------------------------------
    // OPTION A: SAASPAY PAYOUT (Routed via Vercel Webshare Static Proxy Relay)
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

      console.log("[wallet-withdraw -> saaspay via relay] payload:", JSON.stringify(payload));

      try {
        let resp: Response;
        let data: any;

        const relayUrl = Deno.env.get("SAASPAY_RELAY_URL") || DEFAULT_RELAY_URL;

        try {
          console.log("[wallet-withdraw] Routing through Vercel Webshare Relay:", relayUrl);
          resp = await fetch(relayUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payload,
              idempotencyKey,
              apiKey: saaspayKey,
            }),
          });
          data = await resp.json();
          console.log("[wallet-withdraw -> relay response]:", resp.status, JSON.stringify(data));
        } catch (relayErr) {
          console.warn("[wallet-withdraw] Relay call failed, falling back to direct SaaSPay:", relayErr);
          resp = await fetch(`${SAASPAY_BASE_URL}/payouts/initialize/`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${saaspayKey}`,
              "Content-Type": "application/json",
              "Idempotency-Key": idempotencyKey,
            },
            body: JSON.stringify(payload),
          });
          data = await resp.json();
          console.log("[wallet-withdraw -> direct response]:", resp.status, JSON.stringify(data));
        }

        const isSuccess = resp.ok && (
          data.id || data.payout_id || data.status === "success" || data.status === "processing" || data.success === true
        );

        if (isSuccess) {
          const payoutId = data.id || data.payout_id || idempotencyKey;
          await service.from("withdrawals").update({
            pawapay_payout_id: payoutId,
            status: "processing",
          }).eq("id", withdrawal.id);

          // Log transaction in wallet_transactions only upon gateway confirmation
          await service.from("wallet_transactions").insert({
            user_id: user.id, wallet_currency: "FCFA", type: "withdrawal",
            amount: -amount, balance_after: newBalance,
            reference_id: withdrawal.id, reference_type: "withdrawal",
            status: "completed",
            description: `Retrait Mobile Money vers ${formattedPhone}`,
          });

          await service.from("notifications").insert({
            user_id: user.id,
            title: "Demande de retrait en cours",
            message: `Votre virement de ${amount} FCFA vers ${formattedPhone} (${providerCode.toUpperCase()}) est en cours de traitement via SaaSPay.`,
            type: "info",
          });

          return j({ success: true, withdrawal_id: withdrawal.id, status: "processing" });
        } else {
          // Payout failed or rejected by SaaSPay
          // 1. Refund user wallet balance immediately
          await service.from("user_wallets").update({ balance_fcfa: available }).eq("user_id", user.id);
          debited = false;

          const isIpBlock = data?.error?.code === "ip_not_whitelisted";
          const isPayoutNotEnabled = data?.error?.code === "payout_not_enabled";
          console.warn("[wallet-withdraw -> saaspay rejected]:", data);

          await service.from("withdrawals").update({
            status: "failed",
            moneroo_reference: (data?.error?.code || (isIpBlock ? "IP_NOT_WHITELISTED" : "FAILED")).slice(0, 100),
          }).eq("id", withdrawal.id);

          let humanMsg = data?.error?.message || (data?.error?.amount ? data.error.amount[0] : null) || "Échec de l'envoi du virement Mobile Money SaaSPay.";
          if (isPayoutNotEnabled) {
            humanMsg = "SaaSPay : Les retraits automatiques par API (Payouts) ne sont pas encore activés sur votre compte marchand par SaaSPay. Contactez le support SaaSPay pour activer l'option Payout, ou effectuez le virement directement depuis votre compte SaaSPay.";
          } else if (isIpBlock) {
            humanMsg = "SaaSPay : L'adresse IP n'est pas autorisée sur la whitelist de votre marchand.";
          }

          return j({ error: humanMsg }, 400);
        }
      } catch (err: any) {
        console.error("[wallet-withdraw -> saaspay error]", err);
        await service.from("user_wallets").update({ balance_fcfa: available }).eq("user_id", user.id);
        debited = false;
        await service.from("withdrawals").update({ status: "failed", moneroo_reference: "FETCH_ERROR" }).eq("id", withdrawal.id);
        return j({ error: err.message || "Erreur de connexion SaaSPay" }, 400);
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
    console.error("[wallet-withdraw] fatal error:", err);

    if (debited && currentUserId && currentService) {
      try {
        await currentService.from("user_wallets").update({ balance_fcfa: availableBalance }).eq("user_id", currentUserId);
      } catch (refundErr) {
        console.error("[wallet-withdraw] refund error:", refundErr);
      }
    }

    return j({ error: err.message || "Erreur lors du traitement du retrait" }, 500);
  }

  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), {
      status: s, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
