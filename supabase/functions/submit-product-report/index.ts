import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "isidoreagonan@gmail.com";
const LOGO_URL = "https://nexozjpjbhqfjplrogvz.supabase.co/storage/v1/object/public/store-assets/brand/dukaio-logo.png";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const reasonLabel: Record<string, string> = {
  contenu_trompeur: "Promesse trompeuse",
  contenu_illegal: "Contenu illégal",
  arnaque: "Suspicion d'arnaque",
  copyright: "Violation de droits",
  autre: "Autre",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

    const { productId, customerId, customerEmail, reason, details } = await req.json();

    if (!productId || !customerId || !customerEmail || !reason) {
      throw new Error("Champs requis manquants");
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("id", customerId)
      .eq("email", customerEmail)
      .single();

    if (!customer) throw new Error("Client introuvable");

    const { data: product } = await supabase
      .from("products")
      .select("id, title, creator_id, is_published")
      .eq("id", productId)
      .single();

    if (!product || !product.is_published) throw new Error("Produit introuvable");

    const { data: hasOrder } = await supabase.rpc("customer_has_order_with_store", {
      _customer_id: customerId,
      _store_owner_id: product.creator_id,
    });

    if (!hasOrder) throw new Error("Seuls les clients de ce vendeur peuvent signaler ce produit");

    const { error } = await supabase
      .from("product_reports")
      .upsert({
        product_id: productId,
        customer_id: customerId,
        reason,
        details: details?.trim() || null,
      }, { onConflict: "product_id,customer_id" });

    if (error) throw error;

    const [ownerAuth, adminUsers] = await Promise.all([
      supabase.auth.admin.getUserById(product.creator_id),
      supabase.auth.admin.listUsers(),
    ]);

    const ownerEmail = ownerAuth.data.user?.email;
    const adminUser = adminUsers.data?.users?.find((entry: any) => entry.email === ADMIN_EMAIL);

    await supabase.from("notifications").insert({
      user_id: product.creator_id,
      title: "Produit signalé",
      message: `${customer.name} a signalé votre produit ${product.title}.`,
      type: "warning",
    });

    if (adminUser) {
      await supabase.from("notifications").insert({
        user_id: adminUser.id,
        title: "Nouveau signalement produit",
        message: `${product.title} a été signalé pour : ${reasonLabel[reason] || reason}`,
        type: "warning",
      });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#f8fafc;">
        <div style="background:linear-gradient(135deg,#b91c1c,#ef4444);border-radius:20px;padding:28px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="Dukaio" width="52" height="52" style="display:block;margin:0 auto 14px;border-radius:14px;" />
          <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;">Produit signalé</h1>
        </div>
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 20px 20px;padding:28px 24px;">
          <p style="margin:0 0 10px;color:#111827;font-size:16px;"><strong>${escapeHtml(customer.name)}</strong> a signalé le produit <strong>${escapeHtml(product.title)}</strong>.</p>
          <p style="margin:0 0 10px;color:#374151;font-size:15px;"><strong>Motif :</strong> ${escapeHtml(reasonLabel[reason] || reason)}</p>
          ${details?.trim() ? `<div style="border:1px solid #e5e7eb;background:#f9fafb;border-radius:14px;padding:16px;"><p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">${escapeHtml(details.trim())}</p></div>` : ""}
        </div>
      </div>
    `;

    const recipients = [ADMIN_EMAIL, ownerEmail].filter(Boolean) as string[];
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dukaio <noreply@mail.ecom-revolt.com>",
        to: recipients,
        subject: `Signalement produit • ${product.title}`,
        html,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("submit-product-report error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
