
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_2fa_verified_at timestamptz;

CREATE TABLE IF NOT EXISTS public.login_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_otps_lookup
  ON public.login_otps (user_id, used, expires_at);

ALTER TABLE public.login_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System manages login_otps"
  ON public.login_otps
  FOR ALL
  USING (false)
  WITH CHECK (false);
