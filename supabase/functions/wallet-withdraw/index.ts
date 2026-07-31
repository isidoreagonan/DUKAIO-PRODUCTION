// Withdraw from FCFA wallet via PawaPay payout
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAWAPAY_BASE = "https://api.pawapay.io";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = Deno.env.get("PAWAPAY_API_TOKEN");
    if (!token) return j({ error: "PawaPay non configuré" }, 500);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Non authentifié" }, 401);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return j({ error: "Non authentifié" }, 401);

    const { amount, phone, provider } = await req.json();
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

    // Debit wallet first
    const newBalance = available - amount;
    await service.from("user_wallets").update({ balance_fcfa: newBalance }).eq("user_id", user.id);

    // Create withdrawal record
    const { data: withdrawal, error: insErr } = await service.from("withdrawals").insert({
      user_id: user.id,
      amount, fee: 0, net_amount: amount,
      phone_number: `+${cleanPhone}`,
      operator: provider.toLowerCase().split("_")[0],
      provider_code: provider,
      payment_provider: "pawapay",
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
      description: `Retrait Mobile Money vers +${cleanPhone}`,
    });

    const payoutId = crypto.randomUUID();
    const payload = {
      payoutId, amount: Math.round(amount).toString(), currency: "XOF",
      recipient: { type: "MMO", accountDetails: { phoneNumber: cleanPhone, provider } },
      customerMessage: "Dukaio retrait".slice(0, 22),
      metadata: [{ withdrawal_id: withdrawal.id }, { user_id: user.id }],
    };

    const resp = await fetch(`${PAWAPAY_BASE}/v2/payouts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    console.log("[wallet-withdraw]", resp.status, JSON.stringify(data).slice(0, 300));

    if (!resp.ok || data.status === "REJECTED" || data.status === "FAILED") {
      const reason = data?.failureReason?.failureMessage || data?.rejectionReason?.rejectionMessage || "Erreur PawaPay";
      const notConfigured = /not been configured to make payouts/i.test(String(reason));
      if (notConfigured) {
        // Keep pending for manual processing - don't refund
        await service.from("withdrawals").update({ status: "pending" }).eq("id", withdrawal.id);
        await service.from("notifications").insert({
          user_id: user.id, title: "Retrait en traitement manuel",
          message: `Votre retrait de ${amount} FCFA sera traité manuellement sous 24-48h.`,
          type: "info",
        });
        return j({ success: true, withdrawal_id: withdrawal.id, status: "pending_manual" });
      }
      // Refund
      await service.from("user_wallets").update({ balance_fcfa: available }).eq("user_id", user.id);
      await service.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
      await service.from("wallet_transactions").insert({
        user_id: user.id, wallet_currency: "FCFA", type: "refund",
        amount, balance_after: available,
        reference_id: withdrawal.id, reference_type: "withdrawal",
        status: "completed", description: `Remboursement retrait échoué: ${reason}`,
      });
      return j({ error: reason }, 400);
    }

    await service.from("withdrawals").update({ pawapay_payout_id: payoutId }).eq("id", withdrawal.id);
    await service.from("notifications").insert({
      user_id: user.id, title: "Demande de retrait",
      message: `Votre retrait de ${amount} FCFA vers +${cleanPhone} est en cours.`,
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
