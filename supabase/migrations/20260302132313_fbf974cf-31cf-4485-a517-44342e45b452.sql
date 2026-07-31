
-- Add type-specific columns to products table

-- License fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS license_max_activations integer DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS license_validity_days integer DEFAULT NULL;

-- Bundle fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bundle_product_ids uuid[] DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bundle_discount_percent numeric DEFAULT NULL;

-- Course fields  
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS course_content_type text DEFAULT NULL; -- 'video', 'text', 'mixed'

-- Common
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS accepted_formats text DEFAULT NULL; -- for display info
