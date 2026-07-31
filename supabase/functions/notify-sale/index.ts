import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      store_owner_id, product_title, amount, customer_name, customer_email,
      license_key, license_max_activations, license_validity_days,
      promo_code, original_price, discount_percent, discount_amount,
      product_id, download_url, product_type, store_slug
    } = await req.json();

    if (!store_owner_id || !product_title) {
      throw new Error("Paramètres manquants");
    }

    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(store_owner_id);
    if (userError || !user?.email) throw new Error("Vendeur introuvable");

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", store_owner_id)
      .single();

    const sellerName = profile?.display_name || "Vendeur";
    const storeName = profile?.display_name || "Dukaio";
    const isFree = amount === 0;
    const logoUrl = "https://nexozjpjbhqfjplrogvz.supabase.co/storage/v1/object/public/store-assets/brand/dukaio-logo.png";
    const logoHtml = `<img src="${logoUrl}" alt="Dukaio" width="48" height="48" style="display:block;margin:0 auto 12px;border-radius:10px;" />`;

    const hasPromo = !!promo_code;
    const promoInfoHtml = hasPromo ? `
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin: 12px 0;">
        <p style="margin: 0; color: #92400e; font-size: 13px;">
          🏷️ Code promo appliqué : <strong>${promo_code}</strong>
          ${discount_percent ? ` (-${discount_percent}%)` : ''}
          ${discount_amount ? ` (-${discount_amount} FCFA)` : ''}
        </p>
        ${original_price ? `<p style="margin: 4px 0 0 0; color: #92400e; font-size: 12px;">Prix original : ${original_price} FCFA → ${amount} FCFA</p>` : ''}
      </div>
    ` : '';

    // --- Email 1: Notification au vendeur ---
    const sellerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          ${logoHtml}
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎉 Nouvelle vente !</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px;">Bonjour <strong>${sellerName}</strong>,</p>
          <p style="color: #374151; font-size: 16px;">Vous venez de réaliser une vente sur votre boutique !</p>
          
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #374151;"><strong>Produit :</strong> ${product_title}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Montant :</strong> ${isFree ? "Gratuit" : `${amount} FCFA`}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Client :</strong> ${customer_name}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Email client :</strong> ${customer_email}</p>
          </div>
          
          ${promoInfoHtml}
          
          <p style="color: #6b7280; font-size: 14px;">Connectez-vous à votre tableau de bord pour voir les détails.</p>
        </div>
      </div>
    `;

    const sellerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dukaio <noreply@mail.ecom-revolt.com>",
        to: [user.email],
        subject: `🎉 Nouvelle vente : ${product_title}`,
        html: sellerEmailHtml,
      }),
    });

    const sellerResData = await sellerRes.json();
    if (!sellerRes.ok) {
      console.error("Resend seller email error:", JSON.stringify(sellerResData));
    }

    // --- Email 2: Remerciement au client ---
    if (customer_email) {
      const customerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            ${logoHtml}
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Merci pour votre achat ! 🙏</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px;">Bonjour <strong>${customer_name}</strong>,</p>
            <p style="color: #374151; font-size: 16px;">Merci d'avoir effectué un achat chez <strong>${storeName}</strong> !</p>
            
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 15px;">📋 Récapitulatif de commande</h3>
              <p style="margin: 5px 0; color: #374151;"><strong>Produit :</strong> ${product_title}</p>
              ${hasPromo && original_price ? `
                <p style="margin: 5px 0; color: #374151;"><strong>Prix original :</strong> <span style="text-decoration: line-through; color: #9ca3af;">${original_price} FCFA</span></p>
                <p style="margin: 5px 0; color: #374151;"><strong>Réduction :</strong> <span style="color: #059669;">${discount_percent ? `-${discount_percent}%` : `-${discount_amount} FCFA`}</span></p>
              ` : ''}
              <p style="margin: 5px 0; color: #374151; font-size: 18px;"><strong>Total payé :</strong> ${isFree ? "Gratuit" : `${amount} FCFA`}</p>
            </div>

            ${hasPromo ? `
            <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 12px; margin: 12px 0; text-align: center;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">🎉 Vous avez économisé <strong>${original_price ? original_price - amount : 0} FCFA</strong> avec le code <strong>${promo_code}</strong> !</p>
            </div>
            ` : ''}
            
            ${license_key ? `
            <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600;">🔑 Votre clé de licence</p>
              <p style="margin: 0; color: #1e3a8a; font-size: 28px; font-weight: 700; letter-spacing: 3px; font-family: 'Courier New', monospace;">${license_key}</p>
              ${license_max_activations ? `<p style="margin: 8px 0 0 0; color: #3b82f6; font-size: 13px;">Activations max : ${license_max_activations}</p>` : ''}
              ${license_validity_days ? `<p style="margin: 4px 0 0 0; color: #3b82f6; font-size: 13px;">Validité : ${license_validity_days} jours après activation</p>` : ''}
            </div>
            <p style="color: #374151; font-size: 16px;">Conservez précieusement cette clé. Elle vous sera demandée pour activer votre produit.</p>
            ` : ''}

            ${(() => {
              const siteUrl = "https://ecom-revolt.com";
              if (download_url) {
                return `
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${download_url}" target="_blank" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">📥 Télécharger mon produit</a>
                </div>
                `;
              } else if (store_slug && product_id) {
                const productUrl = `${siteUrl}/store/${store_slug}/product/${product_id}`;
                return `
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${productUrl}" target="_blank" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">🔗 Accéder à mon produit</a>
                </div>
                `;
              }
              return `<p style="color: #374151; font-size: 16px;">Votre produit est disponible immédiatement. Si vous avez des questions, n'hésitez pas à contacter le vendeur.</p>`;
            })()}
            
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">À bientôt sur <strong>${storeName}</strong> !</p>
          </div>
        </div>
      `;

      const customerRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${storeName} <noreply@mail.ecom-revolt.com>`,
          to: [customer_email],
          subject: `Merci pour votre achat chez ${storeName} ! 🎉`,
          html: customerEmailHtml,
        }),
      });

      const customerResData = await customerRes.json();
      if (!customerRes.ok) {
        console.error("Resend customer email error:", JSON.stringify(customerResData));
      } else {
        console.log("Thank you email sent to customer:", customer_email);
      }
    }

    // Also create in-app notification
    await supabase.from("notifications").insert({
      user_id: store_owner_id,
      title: "Nouvelle vente",
      message: `${customer_name} a acheté "${product_title}" pour ${isFree ? "gratuit" : `${amount} FCFA`}.${hasPromo ? ` (Code promo: ${promo_code})` : ''}`,
      type: "success",
    });

    // Telegram notifications (seller + admins)
    try {
      const tgText =
        `🎉 <b>Nouvelle vente !</b>\n\n` +
        `📦 <b>${product_title}</b>\n` +
        `💰 ${isFree ? "Gratuit" : `${Number(amount).toLocaleString("fr-FR")} FCFA`}\n` +
        `👤 ${customer_name ?? "Client"} (${customer_email ?? "—"})` +
        (hasPromo ? `\n🏷️ Code promo : <code>${promo_code}</code>` : "");

      const tgUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/telegram-send`;
      const tgHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      };
      // Seller
      await fetch(tgUrl, {
        method: "POST",
        headers: tgHeaders,
        body: JSON.stringify({ target: { user_id: store_owner_id }, text: tgText }),
      });
      // Admins
      await fetch(tgUrl, {
        method: "POST",
        headers: tgHeaders,
        body: JSON.stringify({
          target: { admin: true },
          text: `🛒 <b>Vente plateforme</b>\nVendeur : ${sellerName}\n\n${tgText}`,
        }),
      });
    } catch (tgErr) {
      console.error("Telegram notify-sale error", tgErr);
    }


    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});