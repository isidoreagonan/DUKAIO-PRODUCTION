// Edge function admin: accorder/révoquer un badge à n'importe quel utilisateur
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "isidoreagonan@gmail.com";

const getAdminUser = async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Non authentifié");

  const authClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await authClient.auth.getClaims(token);
  const email = String(data?.claims?.email || "").toLowerCase();

  if (error || !data?.claims?.sub || email !== ADMIN_EMAIL) throw new Error("Accès admin requis");
  return { id: String(data.claims.sub), email };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const adminUser = await getAdminUser(req);

    // Client service_role pour les opérations privilégiées
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action, user_id, grade, months = 1, email } = body as {
      action: "grant" | "revoke" | "find_by_email";
      user_id?: string;
      email?: string;
      grade?: "standard" | "pro" | "premium";
      months?: number;
    };

    if (action === "find_by_email") {
      if (!email) throw new Error("email requis");
      const normalized = email.trim().toLowerCase();
      // Recherche paginée dans auth.users
      let foundUser: any = null;
      for (let page = 1; page <= 20 && !foundUser; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
        if (error) throw error;
        foundUser = data.users.find((u: any) => (u.email || "").toLowerCase() === normalized);
        if (data.users.length < 200) break;
      }
      if (!foundUser) throw new Error("Aucun utilisateur trouvé avec cet email");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, display_name, store_slug, avatar_url")
        .eq("id", foundUser.id)
        .maybeSingle();

      const { data: badge } = await supabase
        .from("verified_badges")
        .select("*")
        .eq("user_id", foundUser.id)
        .maybeSingle();

      return new Response(
        JSON.stringify({ ok: true, user: { id: foundUser.id, email: foundUser.email }, profile, badge }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!user_id) throw new Error("user_id requis");

    if (action === "revoke") {
      await supabase
        .from("verified_badges")
        .update({ status: "revoked" })
        .eq("user_id", user_id);

      await supabase.from("notifications").insert({
        user_id,
        title: "Badge révoqué",
        message: "Votre badge Verify a été révoqué par l'administration.",
        type: "warning",
      });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "grant") {
      if (!grade) throw new Error("grade requis");
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + (months || 1));

      const { data: existing } = await supabase
        .from("verified_badges")
        .select("id")
        .eq("user_id", user_id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("verified_badges")
          .update({
            grade,
            status: "active",
            granted_by_admin: true,
            granted_by: adminUser.id,
            activated_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("verified_badges").insert({
          user_id,
          grade,
          status: "active",
          granted_by_admin: true,
          granted_by: adminUser.id,
          activated_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        });
      }

      await supabase.from("notifications").insert({
        user_id,
        title: "🏅 Badge Verify activé !",
        message: `Votre badge ${grade.toUpperCase()} a été activé par l'administration jusqu'au ${expiresAt.toLocaleDateString("fr-FR")}.`,
        type: "success",
      });

      return new Response(JSON.stringify({ ok: true, expires_at: expiresAt }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Action invalide");
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
