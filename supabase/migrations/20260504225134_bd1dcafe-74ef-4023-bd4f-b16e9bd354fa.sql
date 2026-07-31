ALTER TABLE public.identity_verifications
  ADD COLUMN IF NOT EXISTS document_number text;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_approved_document_number
  ON public.identity_verifications (document_number)
  WHERE status = 'approved' AND document_number IS NOT NULL;