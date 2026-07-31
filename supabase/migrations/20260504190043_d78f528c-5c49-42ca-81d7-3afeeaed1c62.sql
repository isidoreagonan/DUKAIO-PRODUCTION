ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS legal_notice text,
  ADD COLUMN IF NOT EXISTS terms_of_use text,
  ADD COLUMN IF NOT EXISTS privacy_policy text,
  ADD COLUMN IF NOT EXISTS footer_disclaimer text;