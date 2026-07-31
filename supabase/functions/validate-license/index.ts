import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { license_key } = await req.json();

    if (!license_key || typeof license_key !== "string" || license_key.length > 50) {
      return new Response(
        JSON.stringify({ valid: false, error: "license_key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const key = license_key.trim().toUpperCase();

    // Fetch license with product info
    const { data: license, error } = await supabase
      .from("licenses")
      .select("*, products(title, type)")
      .eq("license_key", key)
      .maybeSingle();

    if (error || !license) {
      return new Response(
        JSON.stringify({ valid: false, error: "License not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check status
    if (license.status === "revoked") {
      return new Response(
        JSON.stringify({ valid: false, error: "License has been revoked", status: "revoked" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      // Update status if not already expired
      if (license.status !== "expired") {
        await supabase
          .from("licenses")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("id", license.id);
      }
      return new Response(
        JSON.stringify({ valid: false, error: "License has expired", status: "expired", expires_at: license.expires_at }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get activation count
    const { count: activationCount } = await supabase
      .from("license_activations")
      .select("*", { count: "exact", head: true })
      .eq("license_id", license.id)
      .eq("is_active", true);

    const isActive = license.status === "active";
    const canActivate = (activationCount || 0) < license.max_activations;

    return new Response(
      JSON.stringify({
        valid: true,
        status: license.status,
        is_active: isActive,
        can_activate: canActivate,
        license: {
          key: license.license_key,
          masked_key: license.license_key.replace(/(.{4})-(.+)-(.{4})/, "$1-****-$3"),
        },
        activations: {
          count: activationCount || 0,
          max: license.max_activations,
          remaining: Math.max(0, license.max_activations - (activationCount || 0)),
        },
        product: {
          id: license.product_id,
          title: license.products?.title || null,
        },
        activated_at: license.activated_at,
        expires_at: license.expires_at,
        created_at: license.created_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Validate license error:", error);
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
