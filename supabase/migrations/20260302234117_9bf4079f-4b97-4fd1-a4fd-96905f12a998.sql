
-- Add identity fields to identity_verifications for KYC
ALTER TABLE public.identity_verifications
ADD COLUMN IF NOT EXISTS full_name text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS country text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS city text DEFAULT NULL;
