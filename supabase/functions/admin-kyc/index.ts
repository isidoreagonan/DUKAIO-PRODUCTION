import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "isidoreagonan@gmail.com";
const LOGO_URL = "https://nexozjpjbhqfjplrogvz.supabase.co/storage/v1/object/public/store-assets/brand/dukaio-logo.png";

const getAuthenticatedUser = async (req: Request, supabaseUrl: string, anonKey: string) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabaseAuth.auth.getClaims(authHeader.replace("Bearer ", ""));
  if (error || !data?.claims?.sub) return null;

  return {
    id: String(data.claims.sub),
    email: String(data.claims.email || "").toLowerCase(),
  };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const sendEmail = async ({
  resendApiKey,
  to,
  subject,
  html,
}: {
  resendApiKey: string;
  to: string;
  subject: string;
  html: string;
}) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Dukaio <noreply@mail.ecom-revolt.com>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    console.error("admin-kyc resend error:", await response.text());
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const user = await getAuthenticatedUser(req, supabaseUrl, anonKey);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, verificationId, rejectionReason } = await req.json();

    if (action === "notify_admin") {
      const [submitterProfileResult, adminUsersResult] = await Promise.all([
        supabaseAdmin.from("profiles").select("display_name").eq("id", user.id).single(),
        supabaseAdmin.auth.admin.listUsers(),
      ]);

      const submitterProfile = submitterProfileResult.data;
      const adminUser = adminUsersResult.data?.users?.find((entry: any) => entry.email === ADMIN_EMAIL);
      const submitterName = submitterProfile?.display_name || user.email || "Un utilisateur";

      if (adminUser) {
        await supabaseAdmin.from("notifications").insert({
          user_id: adminUser.id,
          title: "Nouvelle demande KYC 🔔",
          message: `${submitterName} a soumis une demande de vérification d'identité.`,
          type: "info",
        });
      }

      if (resendApiKey) {
        await sendEmail({
          resendApiKey,
          to: ADMIN_EMAIL,
          subject: "Nouvelle demande KYC à vérifier",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#f8fafc;">
              <div style="background:#111827;border-radius:20px;padding:28px 24px;text-align:center;">
                <img src="${LOGO_URL}" alt="Dukaio" width="52" height="52" style="display:block;margin:0 auto 14px;border-radius:14px;" />
                <p style="margin:0;color:#cbd5e1;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Alerte admin</p>
                <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;line-height:1.2;">Nouvelle soumission KYC</h1>
              </div>
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 20px 20px;padding:28px 24px;">
                <p style="margin:0 0 14px;color:#111827;font-size:16px;">${escapeHtml(submitterName)} vient d'envoyer ses documents de vérification.</p>
                <p style="margin:0;color:#6b7280;font-size:14px;">Connectez-vous à l'administration KYC pour examiner le dossier.</p>
              </div>
            </div>
          `,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data: requests, error } = await supabaseAdmin
        .from("identity_verifications")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ requests }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: verification } = await supabaseAdmin
      .from("identity_verifications")
      .select("user_id, full_name")
      .eq("id", verificationId)
      .single();

    if (!verification?.user_id) throw new Error("Demande introuvable");

    const [authUserResult, sellerProfileResult] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(verification.user_id),
      supabaseAdmin.from("profiles").select("display_name").eq("id", verification.user_id).single(),
    ]);

    const sellerEmail = authUserResult.data.user?.email;
    const sellerName = sellerProfileResult.data?.display_name || verification.full_name || sellerEmail || "Utilisateur";

    if (action === "approve") {
      const { error } = await supabaseAdmin
        .from("identity_verifications")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", verificationId);

      if (error) throw error;

      await supabaseAdmin.from("notifications").insert({
        user_id: verification.user_id,
        title: "Identité vérifiée ✅",
        message: "Votre vérification d'identité a été approuvée. Vous pouvez maintenant effectuer des retraits.",
        type: "success",
      });

      if (sellerEmail && resendApiKey) {
        await sendEmail({
          resendApiKey,
          to: sellerEmail,
          subject: "Votre vérification d'identité est approuvée",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#f8fafc;">
              <div style="background:linear-gradient(135deg,#059669,#10b981);border-radius:20px;padding:28px 24px;text-align:center;">
                <img src="${LOGO_URL}" alt="Dukaio" width="52" height="52" style="display:block;margin:0 auto 14px;border-radius:14px;" />
                <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;">KYC approuvé</h1>
              </div>
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 20px 20px;padding:28px 24px;">
                <p style="margin:0 0 14px;color:#111827;font-size:16px;">Bonjour <strong>${escapeHtml(sellerName)}</strong>, votre vérification d'identité a été approuvée.</p>
                <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">Vous pouvez désormais effectuer vos retraits depuis votre tableau de bord.</p>
              </div>
            </div>
          `,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabaseAdmin
      .from("identity_verifications")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", verificationId);

    if (error) throw error;

    await supabaseAdmin.from("notifications").insert({
      user_id: verification.user_id,
      title: "Vérification rejetée ❌",
      message: `Votre vérification d'identité a été rejetée. Motif : ${rejectionReason || "Non spécifié"}. Vous pouvez resoumettre vos documents.`,
      type: "error",
    });

    if (sellerEmail && resendApiKey) {
      await sendEmail({
        resendApiKey,
        to: sellerEmail,
        subject: "Votre vérification d'identité doit être corrigée",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#f8fafc;">
            <div style="background:linear-gradient(135deg,#b91c1c,#ef4444);border-radius:20px;padding:28px 24px;text-align:center;">
              <img src="${LOGO_URL}" alt="Dukaio" width="52" height="52" style="display:block;margin:0 auto 14px;border-radius:14px;" />
              <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;">KYC à corriger</h1>
            </div>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 20px 20px;padding:28px 24px;">
              <p style="margin:0 0 14px;color:#111827;font-size:16px;">Bonjour <strong>${escapeHtml(sellerName)}</strong>, votre vérification d'identité a été rejetée.</p>
              <div style="border:1px solid #fecaca;background:#fef2f2;border-radius:14px;padding:16px;margin-bottom:16px;">
                <p style="margin:0;color:#991b1b;font-size:15px;line-height:1.7;">${escapeHtml(rejectionReason || "Veuillez vérifier vos documents et soumettre une nouvelle version.")}</p>
              </div>
              <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">Corrigez les éléments signalés puis renvoyez votre dossier depuis votre espace compte.</p>
            </div>
          </div>
        `,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("admin-kyc error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
