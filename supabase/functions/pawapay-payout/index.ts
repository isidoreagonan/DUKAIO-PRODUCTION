// PawaPay payout (vendor withdrawal)
// Docs: https://docs.pawapay.io/v2/api-reference/payouts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAWAPAY_BASE = "https://api.pawapay.io";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = Deno.env.get("PAWAPAY_API_TOKEN");
    if (!token) return j({ error: "PawaPay token non configuré" }, 500);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Non authentifié" }, 401);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) return j({ error: "Non authentifié" }, 401);

    const { amount, phone, provider, currency = "XOF" } = await req.json();
    if (!amount || amount < 100) return j({ error: "Montant minimum 100" }, 400);
    if (!phone) return j({ error: "Numéro requis" }, 400);
    if (!provider) return j({ error: "Opérateur requis" }, 400);

    // Compute available balance
    const { data: orders } = await supabase
      .from("orders").select("amount").eq("store_owner_id", user.id).eq("status", "completed");
    const totalSales = (orders || []).reduce((s: number, o: any) => s + Number(o.amount), 0);
    const grossAvailable = totalSales * 0.9; // 10% commission
    const { data: ws } = await supabase
      .from("withdrawals").select("amount").eq("user_id", user.id)
      .in("status", ["pending", "processing", "completed"]);
    const totalWithdrawn = (ws || []).reduce((s: number, w: any) => s + Number(w.amount), 0);
    const available = grossAvailable - totalWithdrawn;
    if (amount > available) {
      return j({ error: `Solde insuffisant. Disponible: ${Math.floor(available)} ${currency}` }, 400);
    }

    const cleanPhone = String(phone).replace(/\D/g, "");

    // Create withdrawal record
    const { data: withdrawal, error: insErr } = await supabase
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount,
        fee: 0,
        net_amount: amount,
        phone_number: `+${cleanPhone}`,
        operator: provider.toLowerCase().split("_")[0], // legacy column
        provider_code: provider,
        status: "processing",
      })
      .select()
      .single();
    if (insErr) return j({ error: insErr.message }, 400);

    const payoutId = crypto.randomUUID();
    const payload = {
      payoutId,
      amount: Math.round(Number(amount)).toString(),
      currency,
      recipient: {
        type: "MMO",
        accountDetails: { phoneNumber: cleanPhone, provider },
      },
      customerMessage: `Dukaio retrait`.slice(0, 22),
      metadata: [
        { withdrawal_id: withdrawal.id },
        { user_id: user.id },
      ],
    };

    console.log("[pawapay-payout] init", payoutId, provider, amount);

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
    console.log("[pawapay-payout] response", resp.status, JSON.stringify(data));

    if (!resp.ok || data.status === "REJECTED" || data.status === "FAILED") {
      const reason =
        data?.failureReason?.failureMessage ||
        data?.rejectionReason?.rejectionMessage ||
        data?.message ||
        data?.error ||
        "Erreur PawaPay";

      // Canal payout pas encore activé côté PawaPay → fallback traitement manuel
      const notConfigured = /not been configured to make payouts/i.test(String(reason));
      if (notConfigured) {
        await supabase.from("withdrawals").update({ status: "pending" }).eq("id", withdrawal.id);
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Retrait en traitement manuel",
          message: `Votre retrait de ${amount} ${currency} vers +${cleanPhone} sera traité manuellement par notre équipe sous 24-48h.`,
          type: "info",
        });
        return j({
          success: true,
          withdrawal_id: withdrawal.id,
          status: "pending_manual",
          message: "Cet opérateur n'est pas encore activé pour les retraits automatiques. Votre demande sera traitée manuellement par notre équipe sous 24-48h.",
        });
      }

      await supabase.from("withdrawals").update({ status: "failed" }).eq("id", withdrawal.id);
      return j({ error: reason }, 400);
    }

    await supabase.from("withdrawals").update({ pawapay_payout_id: payoutId }).eq("id", withdrawal.id);

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Demande de retrait",
      message: `Votre demande de retrait de ${amount} ${currency} vers +${cleanPhone} est en cours.`,
      type: "info",
    });

    return j({ success: true, withdrawal_id: withdrawal.id, status: data.status });
  } catch (err: any) {
    console.error("[pawapay-payout] error", err);
    return j({ error: err.message }, 500);
  }

  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), {
      status: s,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
