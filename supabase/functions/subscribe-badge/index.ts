// Badge subscription — TEMPORARILY DISABLED during PawaPay migration
// Will be re-implemented with PawaPay deposit flow in next iteration
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return new Response(
    JSON.stringify({
      error: "L'abonnement au badge est temporairement indisponible pendant la migration vers notre nouveau processeur de paiement. Disponible sous 24-48h.",
    }),
    { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
