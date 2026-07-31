// PawaPay deposit status check (polling fallback)
// Docs: GET /v2/deposits/{depositId}
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
    if (!token) return j({ error: "Token manquant" }, 500);

    const { depositId, kind = "deposit" } = await req.json();
    if (!depositId) return j({ error: "depositId requis" }, 400);

    const path = kind === "payout" ? "payouts" : "deposits";
    const resp = await fetch(`${PAWAPAY_BASE}/v2/${path}/${depositId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const data = await resp.json();
    console.log("[pawapay-status]", kind, depositId, resp.status, JSON.stringify(data).slice(0, 300));

    if (!resp.ok) return j({ error: data?.message || "Erreur" }, resp.status);

    // PawaPay v2 returns { data: [ {...} ] } — pick first
    const tx = Array.isArray(data?.data) ? data.data[0] : data?.data || data;
    const status = tx?.status; // ACCEPTED | ENQUEUED | COMPLETED | FAILED | REJECTED

    // Sync local payment_events status if changed
    if (kind === "deposit" && status) {
      const localStatus =
        status === "COMPLETED" ? "success" :
        status === "FAILED" || status === "REJECTED" ? "failed" :
        "initiated";
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await admin
        .from("payment_events")
        .update({ status: localStatus })
        .eq("pawapay_deposit_id", depositId);
    }

    return j({ status, raw: tx });
  } catch (err: any) {
    console.error("[pawapay-status] error", err);
    return j({ error: err.message }, 500);
  }

  function j(b: unknown, s = 200) {
    return new Response(JSON.stringify(b), {
      status: s,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
