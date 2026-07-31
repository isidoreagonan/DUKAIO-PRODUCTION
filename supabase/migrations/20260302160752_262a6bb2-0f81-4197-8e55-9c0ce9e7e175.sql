
-- Table for KYC identity verifications
CREATE TABLE public.identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT 'cni',
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification
CREATE POLICY "Users can view own verification"
  ON public.identity_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own verification
CREATE POLICY "Users can submit verification"
  ON public.identity_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending verification
CREATE POLICY "Users can update own pending verification"
  ON public.identity_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');
