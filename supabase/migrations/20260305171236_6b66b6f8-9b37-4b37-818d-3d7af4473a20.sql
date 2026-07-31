ALTER TABLE public.orders ADD COLUMN promo_code text DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN original_amount numeric DEFAULT NULL;
COMMENT ON COLUMN public.orders.promo_code IS 'Promo code used for this order, NULL if none';
COMMENT ON COLUMN public.orders.original_amount IS 'Original price before discount, NULL if no promo used';