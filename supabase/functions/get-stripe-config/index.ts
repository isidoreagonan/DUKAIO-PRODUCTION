// Returns the public Stripe publishable key for the frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const pk = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";
  return new Response(JSON.stringify({ publishableKey: pk }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
