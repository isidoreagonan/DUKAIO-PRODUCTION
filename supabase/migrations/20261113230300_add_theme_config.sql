-- Add theme_config to stores and profiles for store customizer
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS theme_config jsonb DEFAULT NULL;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_config jsonb DEFAULT NULL;

GRANT SELECT (theme_config) ON public.stores TO anon, authenticated;
GRANT SELECT (theme_config) ON public.profiles TO anon, authenticated;
