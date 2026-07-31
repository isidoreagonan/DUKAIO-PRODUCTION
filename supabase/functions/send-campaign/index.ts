import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) throw new Error("RESEND_API_KEY non configurée");

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const anonClient = createClient(supabaseUrl, anonKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Non authentifié");

    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) throw new Error("Non authentifié");

    const { campaignId } = await req.json();
    if (!campaignId) throw new Error("campaignId requis");

    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("creator_id", user.id)
      .single();

    if (campaignError || !campaign) throw new Error("Campagne introuvable");
    if (campaign.status === "sent") throw new Error("Campagne déjà envoyée");

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const senderName = profile?.display_name || "Dukaio";
    const logoUrl = "https://nexozjpjbhqfjplrogvz.supabase.co/storage/v1/object/public/store-assets/brand/dukaio-logo.png";

    let query = supabase
      .from("orders")
      .select("customer_id, customers(email, name)")
      .eq("store_owner_id", user.id);

    if (campaign.recipient_type === "recent_buyers") {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", thirtyDaysAgo);
    }

    const { data: orders, error: ordersError } = await query;
    if (ordersError) throw new Error("Impossible de charger les destinataires");

    const seenEmails = new Set<string>();
    const recipients = (orders || [])
      .map((order) => (order as any).customers)
      .filter((customer) => {
        const email = customer?.email?.trim()?.toLowerCase();
        if (!email || seenEmails.has(email)) return false;
        seenEmails.add(email);
        return true;
      });

    let sentCount = 0;
    let failedCount = 0;

    for (const customer of recipients) {
      const customerName = customer?.name?.trim() || "Client";
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#f8fafc;">
          <div style="background:#111827;border-radius:20px;padding:28px 24px;text-align:center;">
            <img src="${logoUrl}" alt="Dukaio" width="52" height="52" style="display:block;margin:0 auto 14px;border-radius:14px;" />
            <p style="margin:0 0 6px;color:#cbd5e1;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Campagne personnalisée</p>
            <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;">${escapeHtml(campaign.subject)}</h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 20px 20px;padding:28px 24px;">
            <p style="margin:0 0 16px;color:#111827;font-size:16px;">Bonjour <strong>${escapeHtml(customerName)}</strong>,</p>
            <div style="color:#374151;font-size:15px;line-height:1.7;">${campaign.content}</div>
            <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:13px;">Message envoyé par <strong>${escapeHtml(senderName)}</strong> depuis sa boutique Dukaio.</p>
            </div>
          </div>
        </div>
      `;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${senderName} <noreply@mail.ecom-revolt.com>`,
          to: [customer.email],
          subject: campaign.subject,
          html,
        }),
      });

      if (emailResponse.ok) {
        sentCount += 1;
      } else {
        failedCount += 1;
        console.error("send-campaign resend error:", customer.email, await emailResponse.text());
      }
    }

    await supabase
      .from("email_campaigns")
      .update({
        status: sentCount > 0 ? "sent" : "draft",
        sent_count: sentCount,
        sent_at: sentCount > 0 ? new Date().toISOString() : null,
      })
      .eq("id", campaignId);

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: sentCount > 0 ? "Campagne envoyée" : "Campagne non envoyée",
      message:
        sentCount > 0
          ? `Votre campagne \"${campaign.subject}\" a été envoyée à ${sentCount} client(s).${failedCount ? ` ${failedCount} envoi(s) ont échoué.` : ""}`
          : `Aucun email n'a pu être envoyé pour la campagne \"${campaign.subject}\".`,
      type: sentCount > 0 ? "success" : "error",
    });

    return new Response(JSON.stringify({ success: true, sentCount, failedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-campaign error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
