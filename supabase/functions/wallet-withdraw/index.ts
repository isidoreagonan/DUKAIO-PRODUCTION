// Withdraw from FCFA wallet via SaaSPay payout (routed through whitelisted Webshare proxy via native Deno TCP/TLS)
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

// Helper: send request to SaaSPay through whitelisted static IP proxy (Webshare) using native Deno TCP/TLS tunnel
async function sendSaaSPayRequest(
  urlStr: string,
  payload: any,
  apiKey: string,
  idempotencyKey: string
): Promise<{ status: number; data: any }> {
  const proxyHost = Deno.env.get("WEBSHARE_PROXY_HOST") || "p.webshare.io";
  const proxyPort = Number(Deno.env.get("WEBSHARE_PROXY_PORT") || 80);
  const proxyUser = Deno.env.get("WEBSHARE_PROXY_USER") || "gkkoqjad-1";
  const proxyPass = Deno.env.get("WEBSHARE_PROXY_PASS") || "se6uv3i8h2dg";

  const bodyStr = JSON.stringify(payload);
  const url = new URL(urlStr);

  try {
    // 1. Establish raw TCP connection to Webshare proxy
    const proxyConn = await Deno.connect({
      hostname: proxyHost,
      port: proxyPort,
    });

    const proxyAuth = btoa(`${proxyUser}:${proxyPass}`);
    const connectReq =
      `CONNECT ${url.hostname}:443 HTTP/1.1\r\n` +
      `Host: ${url.hostname}:443\r\n` +
      `Proxy-Authorization: Basic ${proxyAuth}\r\n` +
      `Connection: keep-alive\r\n\r\n`;

    await proxyConn.write(new TextEncoder().encode(connectReq));

    // Read proxy response
    const initBuf = new Uint8Array(1024);
    const n = await proxyConn.read(initBuf);
    const proxyResp = new TextDecoder().decode(initBuf.subarray(0, n || 0));

    if (!proxyResp.includes("200")) {
      proxyConn.close();
      throw new Error(`Proxy tunnel rejected: ${proxyResp.slice(0, 100)}`);
    }

    // 2. Upgrade to TLS
    const tlsConn = await Deno.startTls(proxyConn, {
      hostname: url.hostname,
    });

    // 3. Send HTTP POST request over TLS
    const bodyBytes = new TextEncoder().encode(bodyStr);
    const httpReq =
      `POST ${url.pathname}${url.search} HTTP/1.1\r\n` +
      `Host: ${url.hostname}\r\n` +
      `Authorization: Bearer ${apiKey}\r\n` +
      `Content-Type: application/json\r\n` +
      `Idempotency-Key: ${idempotencyKey}\r\n` +
      `Content-Length: ${bodyBytes.length}\r\n` +
      `Connection: close\r\n\r\n`;

    await tlsConn.write(new TextEncoder().encode(httpReq));
    await tlsConn.write(bodyBytes);

    // 4. Read response
    let rawResponse = "";
    const readBuf = new Uint8Array(4096);
    while (true) {
      const bytesRead = await tlsConn.read(readBuf);
      if (!bytesRead || bytesRead === null) break;
      rawResponse += new TextDecoder().decode(readBuf.subarray(0, bytesRead));
    }
    try {
      tlsConn.close();
    } catch (_) {}

    const splitIdx = rawResponse.indexOf("\r\n\r\n");
    const headerPart = rawResponse.slice(0, splitIdx);
    const bodyPart = rawResponse.slice(splitIdx + 4);
    const statusLine = headerPart.split("\r\n")[0];
    const statusCode = parseInt(statusLine.split(" ")[1], 10) || 500;
    const parsedData = JSON.parse(bodyPart);

    return { status: statusCode, data: parsedData };
  } catch (proxyErr) {
    console.warn("[wallet-withdraw] Native proxy tunnel error, falling back to direct fetch:", proxyErr);
    const resp = await fetch(urlStr, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: bodyStr,
    });
    const data = await resp.json();
    return { status: resp.status, data };
  }
}

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
    // OPTION A: SAASPAY PAYOUT (Routed via Whitelisted Webshare Proxy)
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

      console.log("[wallet-withdraw -> saaspay via proxy] payload:", JSON.stringify(payload));

      try {
        const { status: saaspayStatus, data } = await sendSaaSPayRequest(
          `${SAASPAY_BASE_URL}/payouts/initialize/`,
          payload,
          saaspayKey,
          idempotencyKey
        );

        console.log("[wallet-withdraw -> saaspay response]:", saaspayStatus, JSON.stringify(data));

        const isSuccess = saaspayStatus >= 200 && saaspayStatus < 300 && (
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

          const isIpBlock = data?.error?.code === "ip_not_whitelisted" || saaspayStatus === 403;
          console.warn("[wallet-withdraw -> saaspay rejected]:", data);

          await service.from("withdrawals").update({
            status: "failed",
            moneroo_reference: isIpBlock ? "IP_NOT_WHITELISTED" : ((data?.error?.code || "FAILED") as string).slice(0, 100),
          }).eq("id", withdrawal.id);

          let humanMsg = data?.error?.message || (data?.error?.amount ? data.error.amount[0] : null) || "Échec de l'envoi du virement Mobile Money SaaSPay.";
          if (isIpBlock) {
            humanMsg = "Échec SaaSPay : L'IP n'est pas autorisée sur la whitelist de votre marchand (403).";
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
