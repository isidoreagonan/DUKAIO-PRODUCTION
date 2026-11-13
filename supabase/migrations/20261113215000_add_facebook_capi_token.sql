-- Add Facebook CAPI Token column and grant public storefront access to pixel IDs
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS facebook_capi_token text DEFAULT NULL;

-- Allow anonymous visitors to read public tracking pixel IDs on creator storefronts
GRANT SELECT (facebook_pixel_id, tiktok_pixel_id, google_ads_id)
ON public.profiles TO anon, authenticated;

