ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_otp_verified_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_customers_auth_id ON public.customers(auth_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);