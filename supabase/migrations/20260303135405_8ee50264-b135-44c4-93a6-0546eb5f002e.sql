
CREATE TABLE public.buyer_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.buyer_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage buyer otps" ON public.buyer_otps FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_buyer_otps_email_code ON public.buyer_otps(email, code);
