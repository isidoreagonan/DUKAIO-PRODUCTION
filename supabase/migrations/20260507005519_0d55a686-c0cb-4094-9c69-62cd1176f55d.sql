
-- Wallets (mobile money payout accounts)
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  country text NOT NULL,
  provider_code text NOT NULL,
  phone text NOT NULL,
  holder_first_name text NOT NULL,
  holder_last_name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wallets"
  ON public.wallets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Limit 3 wallets per user
CREATE OR REPLACE FUNCTION public.check_max_wallets()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.wallets WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Maximum 3 wallets per user';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER wallets_max_check BEFORE INSERT ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.check_max_wallets();

-- Wallet PIN (one per user)
CREATE TABLE public.wallet_pins (
  user_id uuid PRIMARY KEY,
  pin_hash text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_pins ENABLE ROW LEVEL SECURITY;

-- Only the owner can SEE that a pin exists; mutations go through edge functions (service role)
CREATE POLICY "Users can view own pin row"
  ON public.wallet_pins FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Platform fees (admin-tunable)
CREATE TABLE public.platform_fees (
  key text PRIMARY KEY,
  value_pct numeric NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read fees"
  ON public.platform_fees FOR SELECT USING (true);

CREATE POLICY "Admin can manage fees"
  ON public.platform_fees FOR ALL TO authenticated
  USING (auth.email() = 'isidoreagonan@gmail.com')
  WITH CHECK (auth.email() = 'isidoreagonan@gmail.com');

INSERT INTO public.platform_fees (key, value_pct) VALUES
  ('dukaio_commission_pct', 10),
  ('pawapay_deposit_pct', 3),
  ('pawapay_payout_pct', 2);
