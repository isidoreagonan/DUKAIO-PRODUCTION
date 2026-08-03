import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, email, productId } = await req.json();
    if (!email || !productId) throw new Error("Missing parameters");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: product } = await supabase.from("products").select("id, price, creator_id").eq("id", productId).single();
    if (!product || product.price > 0) throw new Error("Product is not free");

    // Upsert customer
    let { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
      
    let customerId = customer?.id;
    if (!customerId) {
        const { data: newCust, error: newCustError } = await supabase.from("customers").insert({
            name: name,
            email: email.trim().toLowerCase(),
            phone: ""
        }).select("id").single();
        
        if (newCustError) {
          throw new Error("Failed to create customer: " + newCustError.message);
        }
        customerId = newCust?.id;
    }

    const { data: order, error: orderError } = await supabase.from("orders").insert({
      product_id: product.id,
      store_owner_id: product.creator_id,
      customer_id: customerId,
      amount: 0,
      currency: "XOF",
      payment_provider: "free",
      payment_method: "free",
      status: "completed",
    }).select("id").single();
    
    if (orderError) {
      throw new Error("Failed to create order: " + orderError.message);
    }

    return new Response(JSON.stringify({ orderId: order.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
