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

    const { license_key, device_id, device_name } = await req.json();

    if (!license_key || typeof license_key !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "license_key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!device_id || typeof device_id !== "string" || device_id.length > 255) {
      return new Response(
        JSON.stringify({ success: false, error: "device_id is required (max 255 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const key = license_key.trim().toUpperCase();
    const cleanDeviceId = device_id.trim().substring(0, 255);
    const cleanDeviceName = device_name ? String(device_name).trim().substring(0, 100) : null;

    // Get client info
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Fetch license
    const { data: license, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("license_key", key)
      .maybeSingle();

    if (error || !license) {
      return new Response(
        JSON.stringify({ success: false, error: "License not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check revoked
    if (license.status === "revoked") {
      return new Response(
        JSON.stringify({ success: false, error: "License has been revoked" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      await supabase
        .from("licenses")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("id", license.id);

      return new Response(
        JSON.stringify({ success: false, error: "License has expired" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this device is already activated
    const { data: existingActivation } = await supabase
      .from("license_activations")
      .select("*")
      .eq("license_id", license.id)
      .eq("device_id", cleanDeviceId)
      .eq("is_active", true)
      .maybeSingle();

    if (existingActivation) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Device already activated",
          activation: {
            id: existingActivation.id,
            device_id: existingActivation.device_id,
            device_name: existingActivation.device_name,
            activated_at: existingActivation.activated_at,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check activation limit
    const { count: activeCount } = await supabase
      .from("license_activations")
      .select("*", { count: "exact", head: true })
      .eq("license_id", license.id)
      .eq("is_active", true);

    if ((activeCount || 0) >= license.max_activations) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Maximum activations reached",
          activations: {
            count: activeCount || 0,
            max: license.max_activations,
          },
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create activation
    const { data: activation, error: activationError } = await supabase
      .from("license_activations")
      .insert({
        license_id: license.id,
        device_id: cleanDeviceId,
        device_name: cleanDeviceName,
        ip_address: clientIp,
        user_agent: userAgent.substring(0, 500),
      })
      .select()
      .single();

    if (activationError) {
      console.error("Activation error:", activationError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to activate license" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update license status & set expiry on first activation
    const updates: Record<string, any> = {
      status: "active",
      updated_at: new Date().toISOString(),
    };

    // Set activated_at and expires_at on first activation
    if (!license.activated_at) {
      updates.activated_at = new Date().toISOString();
      if (license.validity_days) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + license.validity_days);
        updates.expires_at = expiresAt.toISOString();
      }
    }

    await supabase.from("licenses").update(updates).eq("id", license.id);

    // Dispatch webhook
    const dispatchUrl = `${supabaseUrl}/functions/v1/dispatch-webhook`;
    fetch(dispatchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "license.activated",
        store_owner_id: license.store_owner_id,
        payload: {
          license: {
            id: license.id,
            key: license.license_key,
            product_id: license.product_id,
          },
          activation: {
            device_id: cleanDeviceId,
            device_name: cleanDeviceName,
          },
        },
      }),
    }).catch(console.error);

    return new Response(
      JSON.stringify({
        success: true,
        message: "License activated successfully",
        activation: {
          id: activation.id,
          device_id: activation.device_id,
          device_name: activation.device_name,
          activated_at: activation.activated_at,
        },
        activations: {
          count: (activeCount || 0) + 1,
          max: license.max_activations,
          remaining: license.max_activations - (activeCount || 0) - 1,
        },
        expires_at: updates.expires_at || license.expires_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Activate license error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
