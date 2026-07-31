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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const authClient = createClient(supabaseUrl, anonKey);
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const action = body.action as "new_ticket" | "admin_reply";

    if (action === "new_ticket") {
      const { userId, userName, userEmail, subject, transcript } = body;
      if (user.id !== userId) throw new Error("Unauthorized");

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#f8fafc;">
          <div style="background:#111827;border-radius:20px;padding:28px 24px;text-align:center;">
            <img src="${LOGO_URL}" alt="Dukaio" width="52" height="52" style="display:block;margin:0 auto 14px;border-radius:14px;" />
            <p style="margin:0;color:#cbd5e1;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Support</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;line-height:1.2;">Nouveau ticket client</h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 20px 20px;padding:28px 24px;">
            <p style="margin:0 0 10px;color:#111827;font-size:16px;"><strong>${escapeHtml(userName || "Utilisateur")}</strong> a demandé une assistance humaine.</p>
            <p style="margin:0 0 10px;color:#374151;font-size:15px;"><strong>Email :</strong> ${escapeHtml(userEmail || "Non renseigné")}</p>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;"><strong>Sujet :</strong> ${escapeHtml(subject || "Support")}</p>
            <div style="border:1px solid #e5e7eb;background:#f9fafb;border-radius:14px;padding:16px;">
              <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(transcript || "")}</p>
            </div>
          </div>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Dukaio <noreply@mail.ecom-revolt.com>",
          to: [ADMIN_EMAIL],
          reply_to: userEmail || undefined,
          subject: `Nouveau ticket support • ${subject || "Support"}`,
          html,
        }),
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "admin_reply") {
      if (user.email !== ADMIN_EMAIL) throw new Error("Unauthorized");

      const { recipientEmail, recipientName, replyMessage, subject } = body;
      if (!recipientEmail || !replyMessage) throw new Error("Missing fields");

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#f8fafc;">
          <div style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);border-radius:20px;padding:28px 24px;text-align:center;">
            <img src="${LOGO_URL}" alt="Dukaio" width="52" height="52" style="display:block;margin:0 auto 14px;border-radius:14px;" />
            <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;">Réponse du support</h1>
          </div>
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 20px 20px;padding:28px 24px;">
            <p style="margin:0 0 14px;color:#111827;font-size:16px;">Bonjour <strong>${escapeHtml(recipientName || "Client")}</strong>,</p>
            <div style="border:1px solid #dbeafe;background:#eff6ff;border-radius:14px;padding:16px;">
              <p style="margin:0;color:#1f2937;font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(replyMessage)}</p>
            </div>
            <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">Sujet du ticket : ${escapeHtml(subject || "Support")}</p>
          </div>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Dukaio Support <noreply@mail.ecom-revolt.com>",
          to: [recipientEmail],
          subject: `Réponse du support • ${subject || "Votre ticket"}`,
          html,
        }),
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    console.error("notify-support-ticket error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
