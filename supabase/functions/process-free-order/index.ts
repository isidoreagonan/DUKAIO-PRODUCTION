import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, email, productId, promoCode } = await req.json();
    if (!email || !productId) throw new Error("Paramètres manquants");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: product } = await supabase
      .from("products")
      .select("id, price, creator_id")
      .eq("id", productId)
      .single();

    if (!product) throw new Error("Produit introuvable");

    let isActuallyFree = product.price === 0;
    let promoCodeApplied: string | null = null;
    const originalAmount = product.price;

    if (!isActuallyFree && promoCode) {
      const { data: promoRes } = await supabase.rpc("validate_promo_code", {
        p_code: String(promoCode).trim(),
        p_product_id: product.id,
        p_creator_id: product.creator_id,
      });

      if (promoRes?.valid) {
        let discount = 0;
        if (promoRes.discount_percent) {
          discount = Math.round((product.price * promoRes.discount_percent) / 100);
        } else if (promoRes.discount_amount) {
          discount = Math.round(Number(promoRes.discount_amount));
        }

        if (discount >= product.price) {
          isActuallyFree = true;
          promoCodeApplied = promoRes.code;
          // Increment promo usage
          await supabase.rpc("increment_promo_code_usage", { p_promo_code_id: promoRes.id });
        }
      }
    }

    if (!isActuallyFree) {
      throw new Error("Ce produit n'est pas gratuit");
    }

    // Upsert customer
    let { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
      
    let customerId = customer?.id;
    if (!customerId) {
      const { data: newCust, error: newCustError } = await supabase
        .from("customers")
        .insert({
          name: name || "Client",
          email: email.trim().toLowerCase(),
          phone: "",
        })
        .select("id")
        .single();
        
      if (newCustError) {
        throw new Error("Erreur création client: " + newCustError.message);
      }
      customerId = newCust?.id;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        product_id: product.id,
        store_owner_id: product.creator_id,
        customer_id: customerId,
        amount: 0,
        original_amount: originalAmount,
        promo_code: promoCodeApplied,
        currency: "XOF",
        payment_provider: "free",
        payment_method: "free",
        status: "completed",
        funds_available_at: new Date().toISOString(),
      } as any)
      .select("id")
      .single();
    
    if (orderError) {
      throw new Error("Erreur enregistrement commande: " + orderError.message);
    }

    return new Response(JSON.stringify({ orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
