import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    // ===== REPLY to a contact message =====
    if (action === "reply") {
      const { store_owner_id, recipient_email, recipient_name, reply_message, original_message } = body;

      if (!store_owner_id || !recipient_email || !reply_message) {
        return new Response(JSON.stringify({ error: "Champs requis manquants" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get store owner info
      const { data: owner } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", store_owner_id)
        .single();

      const { data: authUser } = await supabase.auth.admin.getUserById(store_owner_id);
      const ownerEmail = authUser?.user?.email;
      const ownerName = owner?.display_name || "Le vendeur";

      if (RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Dukaio <noreply@mail.ecom-revolt.com>",
            to: [recipient_email],
            subject: `Réponse de ${ownerName} à votre message`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <div style="text-align:center;margin-bottom:16px;"><img src="https://nexozjpjbhqfjplrogvz.supabase.co/storage/v1/object/public/store-assets/brand/dukaio-logo.png" alt="Dukaio" width="48" height="48" style="border-radius:10px;" /></div>
                <h2 style="color:#1a1a1a;">${ownerName} vous a répondu</h2>
                <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin:16px 0;">
                  <p style="margin:0;color:#374151;white-space:pre-wrap;">${reply_message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>
                </div>
                <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
                  <p style="margin:0 0 8px;color:#6b7280;font-size:12px;font-weight:600;">Votre message original :</p>
                  <p style="margin:0;color:#9ca3af;font-size:13px;">${(original_message || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>
                </div>
                <p style="color:#6b7280;font-size:12px;margin-top:16px;">Cet email a été envoyé via Dukaio</p>
              </div>
            `,
            reply_to: ownerEmail || undefined,
          }),
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== NEW contact message (default) =====
    const { store_owner_id, sender_name, sender_email, sender_phone, message } = body;

    if (!store_owner_id || !sender_name || !sender_email || !message) {
      return new Response(JSON.stringify({ error: "Champs requis manquants" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save contact message
    await supabase.from("store_contact_messages").insert({
      store_owner_id,
      sender_name,
      sender_email,
      sender_phone: sender_phone || null,
      message,
    });

    // Get store owner profile for email
    const { data: owner } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", store_owner_id)
      .single();

    // Get store owner email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(store_owner_id);
    const ownerEmail = authUser?.user?.email;

    if (ownerEmail && RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Dukaio <noreply@mail.ecom-revolt.com>",
          to: [ownerEmail],
          subject: `📩 Nouveau message de ${sender_name}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="text-align:center;margin-bottom:16px;"><img src="https://nexozjpjbhqfjplrogvz.supabase.co/storage/v1/object/public/store-assets/brand/dukaio-logo.png" alt="Dukaio" width="48" height="48" style="border-radius:10px;" /></div>
              <h2 style="color:#1a1a1a;">Nouveau message client</h2>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:16px 0;">
                <p style="margin:0 0 8px;"><strong>Nom :</strong> ${sender_name}</p>
                <p style="margin:0 0 8px;"><strong>Email :</strong> ${sender_email}</p>
                ${sender_phone ? `<p style="margin:0 0 8px;"><strong>Téléphone :</strong> ${sender_phone}</p>` : ""}
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0;">
                <p style="margin:0;color:#374151;">${message.replace(/\n/g, "<br>")}</p>
              </div>
              <p style="color:#6b7280;font-size:13px;">Vous pouvez répondre directement depuis votre tableau de bord Dukaio</p>
            </div>
          `,
          reply_to: sender_email,
        }),
      });
    }

    // Create notification
    await supabase.from("notifications").insert({
      user_id: store_owner_id,
      title: `Message de ${sender_name}`,
      message: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
      type: "contact",
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
