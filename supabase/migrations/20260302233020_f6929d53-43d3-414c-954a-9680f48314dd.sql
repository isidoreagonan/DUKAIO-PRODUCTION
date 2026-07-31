-- Add tracking pixel columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS facebook_pixel_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tiktok_pixel_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS google_ads_id text DEFAULT NULL;