
-- Add AI analysis columns to identity_verifications
ALTER TABLE public.identity_verifications
ADD COLUMN IF NOT EXISTS ai_recommendation text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ai_confidence numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ai_analysis_details text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ai_analyzed_at timestamp with time zone DEFAULT NULL;
