import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Try Cloudflare country headers first
    const cfCountry = req.headers.get("cf-ipcountry") || req.headers.get("x-country") || req.headers.get("x-vercel-ip-country");
    if (cfCountry && cfCountry.length === 2 && cfCountry.toLowerCase() !== "xx" && cfCountry.toLowerCase() !== "t1") {
      return new Response(
        JSON.stringify({
          countryCode: cfCountry.toLowerCase(),
          source: "cloudflare-header",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Extract visitor's IP address
    const xForwardedFor = req.headers.get("x-forwarded-for");
    const cfConnectingIp = req.headers.get("cf-connecting-ip");
    let clientIp = "";

    if (xForwardedFor) {
      clientIp = xForwardedFor.split(",")[0].trim();
    } else if (cfConnectingIp) {
      clientIp = cfConnectingIp.trim();
    }

    if (clientIp && !clientIp.startsWith("127.") && !clientIp.startsWith("192.168.") && clientIp !== "::1") {
      // 3. Query server-side country.is with clientIp
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`https://api.country.is/${clientIp}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          if (data?.country && typeof data.country === "string" && data.country.length === 2) {
            return new Response(
              JSON.stringify({
                countryCode: data.country.toLowerCase(),
                ip: clientIp,
                source: "server-country.is",
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch {}

      // 4. Query server-side ipwho.is fallback
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`https://ipwho.is/${clientIp}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          if (data?.country_code && typeof data.country_code === "string" && data.country_code.length === 2) {
            return new Response(
              JSON.stringify({
                countryCode: data.country_code.toLowerCase(),
                ip: clientIp,
                source: "server-ipwho.is",
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch {}
    }

    // Default fallback
    return new Response(
      JSON.stringify({
        countryCode: "bj",
        source: "server-default",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        countryCode: "bj",
        error: err.message,
        source: "server-error",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
