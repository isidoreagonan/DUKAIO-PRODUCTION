
-- ============================================================
-- PHASE 2: Dual Wallet Schema (FCFA + USD)
-- ============================================================

-- 1. Add currency + provider columns to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'XOF',
  ADD COLUMN IF NOT EXISTS payment_provider text NOT NULL DEFAULT 'pawapay',
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS funds_available_at timestamptz;

-- 2. Add provider column to withdrawals
ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS payment_provider text NOT NULL DEFAULT 'pawapay';

-- 3. WALLETS table (1 row per user, dual balances)
CREATE TABLE IF NOT EXISTS public.user_wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_fcfa numeric NOT NULL DEFAULT 0,
  balance_usd numeric NOT NULL DEFAULT 0,
  pending_fcfa numeric NOT NULL DEFAULT 0,
  pending_usd numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON public.user_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all wallets"
  ON public.user_wallets FOR SELECT
  TO authenticated
  USING (auth.email() = 'isidoreagonan@gmail.com');

-- Inserts/Updates restricted to service_role only (no policy = denied)

CREATE TRIGGER user_wallets_updated_at
  BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. WALLET TRANSACTIONS (audit trail)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_currency text NOT NULL CHECK (wallet_currency IN ('FCFA','USD')),
  type text NOT NULL CHECK (type IN ('sale','commission','withdrawal','conversion_out','conversion_in','refund','adjustment')),
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  reference_id uuid,
  reference_type text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','reversed')),
  available_at timestamptz,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON public.wallet_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_pending ON public.wallet_transactions(status, available_at) WHERE status = 'pending';

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (auth.email() = 'isidoreagonan@gmail.com');

-- 5. CURRENCY CONVERSIONS (USD -> FCFA via AI)
CREATE TABLE IF NOT EXISTS public.currency_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL,
  rate_used numeric NOT NULL,
  amount_fcfa numeric NOT NULL,
  ai_analysis jsonb,
  ai_source text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_conversions_user ON public.currency_conversions(user_id, created_at DESC);

ALTER TABLE public.currency_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversions"
  ON public.currency_conversions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all conversions"
  ON public.currency_conversions FOR SELECT
  TO authenticated
  USING (auth.email() = 'isidoreagonan@gmail.com');

-- 6. MIGRATION: existing balances -> wallet_fcfa
-- Compute: sum(orders.amount * 0.9) - sum(withdrawals approved) per user
INSERT INTO public.user_wallets (user_id, balance_fcfa)
SELECT
  o.store_owner_id AS user_id,
  GREATEST(
    COALESCE(SUM(o.amount), 0) * 0.9
    - COALESCE((
      SELECT SUM(w.amount)
      FROM public.withdrawals w
      WHERE w.user_id = o.store_owner_id
        AND w.status IN ('completed','processing','pending')
    ), 0),
    0
  ) AS balance_fcfa
FROM public.orders o
WHERE o.status = 'completed'
GROUP BY o.store_owner_id
ON CONFLICT (user_id) DO NOTHING;
