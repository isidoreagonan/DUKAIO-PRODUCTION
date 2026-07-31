// PawaPay callback webhook -> finalize order + credit wallet FCFA pending
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    console.log("[pawapay-webhook]", JSON.stringify(body).slice(0, 500));

    const depositId = body.depositId || body.payoutId;
    const status = body.status; // COMPLETED | FAILED | REJECTED
    const amount = body.amount;
    if (!depositId || !status) return new Response("ok", { status: 200 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // PAYOUT (withdrawal)
    if (body.payoutId) {
      const newStatus = status === "COMPLETED" ? "completed" : "failed";
      const { data: w } = await supabase.from("withdrawals")
        .select("id, user_id, amount, status").eq("pawapay_payout_id", body.payoutId).maybeSingle();
      if (w && w.status !== newStatus) {
        await supabase.from("withdrawals").update({ status: newStatus }).eq("id", w.id);
        if (newStatus === "failed") {
          // Refund the FCFA balance
          const { data: uw } = await supabase.from("user_wallets")
            .select("balance_fcfa").eq("user_id", w.user_id).single();
          const newBal = Number(uw?.balance_fcfa || 0) + Number(w.amount);
          await supabase.from("user_wallets")
            .update({ balance_fcfa: newBal }).eq("user_id", w.user_id);
          await supabase.from("wallet_transactions").insert({
            user_id: w.user_id, wallet_currency: "FCFA", type: "refund",
            amount: Number(w.amount), balance_after: newBal,
            reference_id: w.id, reference_type: "withdrawal",
            status: "completed", description: "Retrait échoué — remboursement",
          });
        }
      }
      return new Response("ok", { status: 200 });
    }

    // DEPOSIT (sale)
    const { data: ev } = await supabase.from("payment_events")
      .select("*").eq("pawapay_deposit_id", depositId).maybeSingle();
    if (!ev) return new Response("ok", { status: 200 });

    if (status !== "COMPLETED") {
      await supabase.from("payment_events").update({ status: "failed" }).eq("id", ev.id);
      return new Response("ok", { status: 200 });
    }

    // Find or create order
    const { data: existingOrder } = await supabase.from("orders")
      .select("id, status").eq("pawapay_deposit_id", depositId).maybeSingle();
    if (existingOrder?.status === "completed") return new Response("ok", { status: 200 });

    // Insert order if doesn't exist
    let orderId = existingOrder?.id;
    if (!orderId) {
      const { data: cust } = await supabase.from("customers").select("id, name, email")
        .eq("email", ev.session_id?.split("|")[0] || "").maybeSingle();
      // For safety, lookup customer via payment_events metadata in pawapay-deposit; we stored customer_id in metadata
      const { data: created } = await supabase.from("orders").insert({
        product_id: ev.product_id,
        store_owner_id: ev.store_owner_id,
        customer_id: cust?.id || null,
        amount: Number(amount || ev.amount),
        currency: "XOF",
        payment_provider: "pawapay",
        payment_method: "mobile_money",
        pawapay_deposit_id: depositId,
        status: "completed",
        funds_available_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      } as any).select("id").single();
      orderId = created?.id;
    } else {
      await supabase.from("orders").update({
        status: "completed",
        funds_available_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      }).eq("id", orderId);
    }

    await supabase.from("payment_events").update({ status: "success" }).eq("id", ev.id);

    // Credit pending_fcfa
    const grossXof = Number(amount || ev.amount);
    const net = grossXof * 0.9;
    await supabase.from("user_wallets").upsert({ user_id: ev.store_owner_id }, { onConflict: "user_id" });
    const { data: w } = await supabase.from("user_wallets")
      .select("pending_fcfa").eq("user_id", ev.store_owner_id).single();
    const newPending = Number(w?.pending_fcfa || 0) + net;
    await supabase.from("user_wallets")
      .update({ pending_fcfa: newPending }).eq("user_id", ev.store_owner_id);

    await supabase.from("wallet_transactions").insert({
      user_id: ev.store_owner_id,
      wallet_currency: "FCFA",
      type: "sale",
      amount: net,
      balance_after: newPending,
      reference_id: orderId,
      reference_type: "order",
      status: "pending",
      available_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      description: "Vente Mobile Money (net après 10% commission)",
    });

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    console.error("[pawapay-webhook] error", e);
    return new Response("ok", { status: 200 });
  }
});
