// Cron job: release pending_fcfa (after 24h) and pending_usd (after 7 days) to available balance
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = new Date().toISOString();

  // Find all pending transactions whose available_at is now reached
  const { data: ready, error } = await supabase
    .from("wallet_transactions")
    .select("id, user_id, wallet_currency, amount")
    .eq("status", "pending")
    .lte("available_at", now)
    .limit(500);

  if (error) {
    console.error("[release] query err", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let processed = 0;
  for (const tx of ready || []) {
    try {
      const col = tx.wallet_currency === "USD" ? "balance_usd" : "balance_fcfa";
      const pendingCol = tx.wallet_currency === "USD" ? "pending_usd" : "pending_fcfa";

      const { data: w } = await supabase.from("user_wallets")
        .select(`${col}, ${pendingCol}`).eq("user_id", tx.user_id).single();
      if (!w) continue;

      const newBal = Number((w as any)[col]) + Number(tx.amount);
      const newPending = Math.max(0, Number((w as any)[pendingCol]) - Number(tx.amount));

      await supabase.from("user_wallets").update({
        [col]: newBal,
        [pendingCol]: newPending,
      }).eq("user_id", tx.user_id);

      await supabase.from("wallet_transactions").update({
        status: "completed",
        balance_after: newBal,
      }).eq("id", tx.id);

      processed++;
    } catch (e) {
      console.error("[release] tx err", tx.id, e);
    }
  }

  return new Response(JSON.stringify({ processed, total: ready?.length || 0 }), {
    headers: { "Content-Type": "application/json" },
  });
});
