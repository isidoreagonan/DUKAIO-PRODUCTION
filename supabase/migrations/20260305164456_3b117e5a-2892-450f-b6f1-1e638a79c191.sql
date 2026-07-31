
ALTER TABLE public.promo_codes ADD COLUMN product_ids uuid[] DEFAULT NULL;
COMMENT ON COLUMN public.promo_codes.product_ids IS 'NULL means applies to all products, otherwise only to listed product IDs';
