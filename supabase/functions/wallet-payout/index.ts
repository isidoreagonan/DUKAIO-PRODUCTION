// Initiate a payout from a saved wallet, requires unlock_token from wallet-pin-verify
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PAWAPAY_BASE = "https://api.pawapay.io";

async function getKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const token = Deno.env.get("PAWAPAY_API_TOKEN");
    if (!token) return j({ error: "PawaPay non configuré" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Non authentifié" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return j({ error: "Non authentifié" }, 401);

    const { wallet_id, amount, unlock_token, currency = "XOF" } = await req.json();
    if (!wallet_id) return j({ error: "Wallet requis" }, 400);
    if (!unlock_token) return j({ error: "PIN requis" }, 401);
    if (!amount || amount < 100) return j({ error: "Montant minimum 100" }, 400);

    // Verify unlock token
    try {
      const key = await getKey();
      const payload = await verify(unlock_token, key);
      if (payload.sub !== user.id || payload.aud !== "wallet") {
        return j({ error: "Token invalide" }, 401);
      }
    } catch {
      return j({ error: "PIN expiré, ressaisissez votre PIN" }, 401);
    }

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: wallet } = await admin.from("wallets").select("*").eq("id", wallet_id).eq("user_id", user.id).maybeSingle();
    if (!wallet) return j({ error: "Wallet introuvable" }, 404);

    // Compute available NET balance (after Dukaio commission)
    const { data: feeRow } = await admin.from("platform_fees").select("value_pct").eq("key", "dukaio_commission_pct").maybeSingle();
    const commissionPct = Number(feeRow?.value_pct ?? 10) / 100;

    const cutoff = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { data: orders } = await admin
      .from("orders").select("amount, created_at")
      .eq("store_owner_id", user.id).eq("status", "completed");
    const matured = (orders || []).filter((o: any) => o.created_at <= cutoff)
      .reduce((s: number, o: any) => s + Number(o.amount), 0);
    const netAvailable = matured * (1 - commissionPct);

    const { data: ws } = await admin
      .from("withdrawals").select("amount").eq("user_id", user.id)
      .in("status", ["pending", "processing", "completed"]);
    const totalWithdrawn = (ws || []).reduce((s: number, w: any) => s + Number(w.amount), 0);
    const available = netAvailable - totalWithdrawn;

    if (amount > available) {
      return j({ error: `Solde insuffisant. Disponible: ${Math.floor(available)} ${currency}` }, 400);
    }

    const cleanPhone = String(wallet.phone).replace(/\D/g, "");

    const { data: withdrawal, error: insErr } = await admin
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount,
        fee: 0,
        net_amount: amount,
        phone_number: `+${cleanPhone}`,
        operator: wallet.provider_code.toLowerCase().split("_")[0],
        provider_code: wallet.provider_code,
        status: "processing",
      })
      .select().single();
    if (insErr) return j({ error: insErr.message }, 400);

    const payoutId = crypto.randomUUID();
    const payload = {
      payoutId,
      amount: Math.round(Number(amount)).toString(),
      currency,
      recipient: {
        type: "MMO",
        accountDetails: { phoneNumber: cleanPhone, provider: wallet.provider_code },
      },
      customerMessage: `Dukaio retrait`.slice(0, 22),
      metadata: [
        { withdrawal_id: withdrawal.id },
        { user_id: user.id },
        { wallet_id: wallet.id },
      ],
    };

    const resp = await fetch(`${PAWAPAY_BASE}/v2/payouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    console.log("[wallet-payout]", resp.status, JSON.stringify(data));

    if (!resp.ok || data.status === "REJECTED" || data.status === "FAILED") {
      const reason = data?.failureReason?.failureMessage || data?.rejectionReason?.rejectionMessage || data?.message || "Erreur PawaPay";
      const notConfigured = /not been configured to make payouts/i.test(String(reason));
      if (notConfigured) {
        await admin.from("withdrawals").update({ status: "pending" }).eq("id", withdrawal.id);
        await admin.from("notifications").insert({
          user_id: user.id,
          title: "Retrait en traitement manuel",
          message: `Votre retrait de ${amount} ${currency} vers +${cleanPhone} sera traité sous 24-48h.`,
          type: "info",
        });
        return j({ success: true, withdrawal_id: withdrawal.id, status: "pending_manual" });
      }
      await admin.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
      return j({ error: reason }, 400);
    }

    await admin.from("withdrawals").update({ pawapay_payout_id: payoutId }).eq("id", withdrawal.id);
    await admin.from("notifications").insert({
      user_id: user.id,
      title: "Retrait initié",
      message: `Retrait de ${amount} ${currency} vers ${wallet.name} en cours.`,
      type: "info",
    });

    return j({ success: true, withdrawal_id: withdrawal.id, status: data.status });
  } catch (e: any) {
    console.error("[wallet-payout] error", e);
    return j({ error: e.message }, 500);
  }
  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
