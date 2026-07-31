import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { order_id, email } = await req.json();
    if (!order_id) return json({ error: "Commande requise" }, 400);
    if (!email) return json({ error: "Email requis" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select(`
        id, amount, status, created_at, product_id, store_owner_id, customer_id,
        products(id, title, type, thumbnail_url, download_url, description),
        customers(id, name, email)
      `)
      .eq("id", order_id)
      .maybeSingle();

    if (orderErr) return json({ error: orderErr.message }, 400);
    if (!order) return json({ error: "Commande introuvable" }, 404);
    if (email && (order.customers?.email || "").toLowerCase() !== String(email).toLowerCase().trim()) {
      return json({ error: "Email différent de celui de la commande" }, 403);
    }

    const { data: store } = await admin
      .from("profiles")
      .select("id, display_name, store_slug, contact")
      .eq("id", order.store_owner_id)
      .maybeSingle();

    const response: Record<string, unknown> = { order: { ...order, profiles: store || null } };

    if (order.status === "completed" && order.products?.type === "course") {
      const { data: lessons } = await admin
        .from("course_lessons")
        .select("id, title, description, video_url, video_type, position, duration_minutes")
        .eq("product_id", order.product_id)
        .order("position");
      response.lessons = lessons || [];
    }

    if (order.status === "completed" && order.products?.type === "license") {
      const { data: licenses } = await admin
        .from("licenses")
        .select("license_key, status, max_activations, expires_at, activated_at")
        .eq("order_id", order.id);
      response.licenses = licenses || [];
    }

    return json(response);
  } catch (err: any) {
    console.error("[buyer-order-access] error", err);
    return json({ error: "Erreur serveur" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}