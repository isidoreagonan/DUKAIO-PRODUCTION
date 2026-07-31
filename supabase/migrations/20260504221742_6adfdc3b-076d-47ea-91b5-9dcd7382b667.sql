ALTER TABLE public.identity_verifications
  ADD COLUMN IF NOT EXISTS didit_session_id TEXT,
  ADD COLUMN IF NOT EXISTS didit_session_url TEXT,
  ADD COLUMN IF NOT EXISTS didit_decision JSONB;

CREATE INDEX IF NOT EXISTS idx_identity_verif_didit_session
  ON public.identity_verifications(didit_session_id);