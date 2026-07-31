import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "isidoreagonan@gmail.com";

const getAdminUser = async (req: Request, supabaseUrl: string, anonKey: string) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabaseAuth.auth.getClaims(authHeader.replace("Bearer ", ""));
  const email = String(data?.claims?.email || "").toLowerCase();

  if (error || !data?.claims?.sub || email !== ADMIN_EMAIL) return null;
  return { id: String(data.claims.sub), email };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const user = await getAdminUser(req, supabaseUrl, anonKey);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    // ── DASHBOARD STATS ──
    if (action === "stats") {
      const { data: totalUsers } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true });
      const { count: usersCount } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true });

      const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("amount, created_at, status")
        .eq("status", "completed");

      const totalRevenue = orders?.reduce((s, o) => s + Number(o.amount), 0) || 0;
      const totalCommissions = totalRevenue * 0.1;

      const { count: productsCount } = await supabaseAdmin.from("products").select("id", { count: "exact", head: true });
      const { count: storesCount } = await supabaseAdmin.from("stores").select("id", { count: "exact", head: true });

      // Sales by day (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: recentOrders } = await supabaseAdmin
        .from("orders")
        .select("amount, created_at")
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo);

      const dailySales: Record<string, number> = {};
      recentOrders?.forEach((o) => {
        const day = o.created_at.slice(0, 10);
        dailySales[day] = (dailySales[day] || 0) + Number(o.amount);
      });

      const { count: pendingWithdrawals } = await supabaseAdmin
        .from("withdrawals")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: pendingKyc } = await supabaseAdmin
        .from("identity_verifications")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: openTickets } = await supabaseAdmin
        .from("support_conversations")
        .select("id", { count: "exact", head: true })
        .eq("status", "open");

      return new Response(JSON.stringify({
        usersCount, totalRevenue, totalCommissions,
        productsCount, storesCount, dailySales,
        pendingWithdrawals, pendingKyc, openTickets,
        totalOrders: orders?.length || 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ALL WITHDRAWALS ──
    if (action === "list_withdrawals") {
      const { data: withdrawals } = await supabaseAdmin
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      // Get profile info for each user
      const userIds = [...new Set(withdrawals?.map(w => w.user_id) || [])];
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, display_name, first_name, last_name, phone")
        .in("id", userIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });

      return new Response(JSON.stringify({
        withdrawals: withdrawals?.map(w => ({
          ...w,
          profile: profileMap[w.user_id] || null,
        })),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── UPDATE WITHDRAWAL STATUS ──
    if (action === "update_withdrawal") {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      const { withdrawalId, status } = params;
      const { error } = await supabaseAdmin
        .from("withdrawals")
        .update({ status, processed_at: status === "completed" || status === "rejected" ? new Date().toISOString() : null })
        .eq("id", withdrawalId);
      if (error) throw error;

      // Get withdrawal + user info
      const { data: w } = await supabaseAdmin.from("withdrawals").select("user_id, amount, net_amount, operator, phone_number, fee, status").eq("id", withdrawalId).single();
      if (w) {
        // In-app notification
        await supabaseAdmin.from("notifications").insert({
          user_id: w.user_id,
          title: status === "completed" ? "Retrait approuvé ✅" : "Retrait rejeté ❌",
          message: status === "completed"
            ? `Votre retrait de ${w.net_amount} FCFA a été approuvé et sera traité sous peu.`
            : `Votre retrait de ${w.net_amount} FCFA a été rejeté. Veuillez contacter le support.`,
          type: status === "completed" ? "success" : "error",
        });

        // Email notification
        if (RESEND_API_KEY) {
          const { data: { user: sellerUser } } = await supabaseAdmin.auth.admin.getUserById(w.user_id);
          const { data: profile } = await supabaseAdmin.from("profiles").select("display_name").eq("id", w.user_id).single();
          const sellerName = profile?.display_name || "Créateur";
          const logoUrl = "https://nexozjpjbhqfjplrogvz.supabase.co/storage/v1/object/public/store-assets/brand/dukaio-logo.png";

          if (sellerUser?.email) {
            const isApproved = status === "completed";
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, ${isApproved ? '#10b981, #059669' : '#ef4444, #dc2626'}); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                  <img src="${logoUrl}" alt="Dukaio" width="48" height="48" style="display:block;margin:0 auto 12px;border-radius:10px;" />
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${isApproved ? '✅ Retrait approuvé' : '❌ Retrait rejeté'}</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                  <p style="color: #374151; font-size: 16px;">Bonjour <strong>${sellerName}</strong>,</p>
                  <p style="color: #374151; font-size: 16px;">${isApproved
                    ? 'Votre demande de retrait a été approuvée et sera traitée sous peu.'
                    : 'Votre demande de retrait a été rejetée. Veuillez contacter le support pour plus d\'informations.'
                  }</p>
                  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 5px 0; color: #374151;"><strong>Montant :</strong> ${w.net_amount} FCFA</p>
                    <p style="margin: 5px 0; color: #374151;"><strong>Frais :</strong> ${w.fee} FCFA</p>
                    <p style="margin: 5px 0; color: #374151;"><strong>Opérateur :</strong> ${w.operator.toUpperCase()}</p>
                    <p style="margin: 5px 0; color: #374151;"><strong>Numéro :</strong> ${w.phone_number}</p>
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">— L'équipe Dukaio</p>
                </div>
              </div>
            `;

            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
              body: JSON.stringify({
                from: "Dukaio <noreply@mail.ecom-revolt.com>",
                to: [sellerUser.email],
                subject: isApproved ? `✅ Retrait de ${w.net_amount} FCFA approuvé` : `❌ Retrait de ${w.net_amount} FCFA rejeté`,
                html: emailHtml,
              }),
            });
            const resData = await res.text();
            if (!res.ok) console.error("Resend withdrawal email error:", resData);
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ALL SUPPORT CONVERSATIONS ──
    if (action === "list_support") {
      const { data: conversations } = await supabaseAdmin
        .from("support_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100);

      return new Response(JSON.stringify({ conversations }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── SUPPORT MESSAGES ──
    if (action === "get_messages") {
      const { conversationId } = params;
      const { data: messages } = await supabaseAdmin
        .from("support_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      return new Response(JSON.stringify({ messages }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── SEND ADMIN REPLY ──
    if (action === "send_reply") {
      const { conversationId, content } = params;
      const { error } = await supabaseAdmin.from("support_messages").insert({
        conversation_id: conversationId,
        content,
        sender_type: "admin",
        sender_id: user.id,
      });
      if (error) throw error;

      await supabaseAdmin.from("support_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CLOSE CONVERSATION ──
    if (action === "close_conversation") {
      const { conversationId } = params;
      await supabaseAdmin.from("support_conversations")
        .update({ status: "closed", updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LIST ALL PRODUCTS ──
    if (action === "list_products") {
      const { data: products } = await supabaseAdmin
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      const creatorIds = [...new Set(products?.map(p => p.creator_id) || [])];
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, display_name, first_name, last_name")
        .in("id", creatorIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });

      return new Response(JSON.stringify({
        products: products?.map(p => ({
          ...p,
          creator: profileMap[p.creator_id] || null,
        })),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── TOGGLE PRODUCT PUBLISH ──
    if (action === "toggle_product") {
      const { productId, isPublished } = params;
      const { error } = await supabaseAdmin
        .from("products")
        .update({ is_published: isPublished })
        .eq("id", productId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE PRODUCT ──
    if (action === "delete_product") {
      const { productId } = params;
      const { error } = await supabaseAdmin
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LIST ALL STORES ──
    if (action === "list_stores") {
      const { data: stores } = await supabaseAdmin
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false });

      const ownerIds = [...new Set(stores?.map(s => s.owner_id) || [])];
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, display_name, first_name, last_name")
        .in("id", ownerIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });

      return new Response(JSON.stringify({
        stores: stores?.map(s => ({
          ...s,
          owner: profileMap[s.owner_id] || null,
        })),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ARCHIVE STORE ──
    if (action === "archive_store") {
      const { storeId, isArchived } = params;
      const { error } = await supabaseAdmin
        .from("stores")
        .update({ is_archived: isArchived })
        .eq("id", storeId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
