import { loadStripe, Stripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = async (): Promise<Stripe | null> => {
  if (stripePromise) return stripePromise;
  stripePromise = (async () => {
    try {
      const { data } = await supabase.functions.invoke("get-stripe-config");
      const pk = data?.publishableKey;
      if (!pk) return null;
      return await loadStripe(pk);
    } catch (e) {
      console.error("[stripe] failed to init", e);
      return null;
    }
  })();
  return stripePromise;
};
