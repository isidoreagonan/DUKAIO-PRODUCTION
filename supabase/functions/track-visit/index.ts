import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { UAParser } from "https://esm.sh/ua-parser-js@1.0.35";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { path, referrer } = await req.json();

    // Get user agent and IP/country headers
    const userAgent = req.headers.get("user-agent") || "";
    // Cloudflare/Vercel typically pass country in CF-IPCountry or x-vercel-ip-country
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "XX";

    // Parse User Agent
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown";
    
    // Determine device type
    const device = parser.getDevice().type; // 'mobile', 'tablet', undefined (desktop)
    const deviceType = device === "mobile" ? "mobile" : (device === "tablet" ? "tablet" : "desktop");

    // Insert into page_views table
    const { error } = await supabaseAdmin.from("page_views").insert({
      path: path || "/",
      referrer: referrer || "direct",
      device_type: deviceType,
      browser,
      country,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
