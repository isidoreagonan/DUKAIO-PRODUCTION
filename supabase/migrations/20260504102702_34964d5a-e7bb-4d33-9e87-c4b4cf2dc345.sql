
-- ENUM grades
CREATE TYPE public.badge_grade AS ENUM ('standard', 'pro', 'premium');
CREATE TYPE public.badge_status AS ENUM ('pending_payment', 'active', 'expired', 'revoked');

-- Table principale du badge actif d'un utilisateur
CREATE TABLE public.verified_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  grade public.badge_grade NOT NULL,
  status public.badge_status NOT NULL DEFAULT 'pending_payment',
  ai_score NUMERIC,
  ai_recommendation TEXT,
  granted_by_admin BOOLEAN NOT NULL DEFAULT false,
  granted_by UUID,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Abonnements / paiements mensuels du badge
CREATE TABLE public.badge_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID,
  grade public.badge_grade NOT NULL,
  amount NUMERIC NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|paid|failed|cancelled
  moneroo_transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historique des analyses IA (eligibility scans)
CREATE TABLE public.badge_eligibility_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  sales_last_30d INTEGER NOT NULL DEFAULT 0,
  visits_last_30d INTEGER NOT NULL DEFAULT 0,
  positive_reviews INTEGER NOT NULL DEFAULT 0,
  kyc_verified BOOLEAN NOT NULL DEFAULT false,
  computed_grade public.badge_grade,
  ai_score NUMERIC,
  ai_reasoning TEXT,
  is_eligible BOOLEAN NOT NULL DEFAULT false,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_verified_badges_user ON public.verified_badges(user_id);
CREATE INDEX idx_verified_badges_status ON public.verified_badges(status);
CREATE INDEX idx_badge_subs_user ON public.badge_subscriptions(user_id);
CREATE INDEX idx_badge_scans_user ON public.badge_eligibility_scans(user_id);

-- RLS
ALTER TABLE public.verified_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_eligibility_scans ENABLE ROW LEVEL SECURITY;

-- verified_badges policies
CREATE POLICY "Public can view active badges"
  ON public.verified_badges FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users view own badge"
  ON public.verified_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin views all badges"
  ON public.verified_badges FOR SELECT
  USING (auth.email() = 'isidoreagonan@gmail.com');

CREATE POLICY "Admin manages badges"
  ON public.verified_badges FOR ALL
  USING (auth.email() = 'isidoreagonan@gmail.com')
  WITH CHECK (auth.email() = 'isidoreagonan@gmail.com');

-- badge_subscriptions policies
CREATE POLICY "Users view own subscriptions"
  ON public.badge_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin views all subscriptions"
  ON public.badge_subscriptions FOR SELECT
  USING (auth.email() = 'isidoreagonan@gmail.com');

-- badge_eligibility_scans policies
CREATE POLICY "Users view own scans"
  ON public.badge_eligibility_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin views all scans"
  ON public.badge_eligibility_scans FOR SELECT
  USING (auth.email() = 'isidoreagonan@gmail.com');

-- updated_at trigger
CREATE TRIGGER update_verified_badges_updated_at
  BEFORE UPDATE ON public.verified_badges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function: get current active badge of a user
CREATE OR REPLACE FUNCTION public.get_user_active_badge(_user_id UUID)
RETURNS TABLE(grade public.badge_grade, expires_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT vb.grade, vb.expires_at
  FROM public.verified_badges vb
  WHERE vb.user_id = _user_id
    AND vb.status = 'active'
    AND (vb.expires_at IS NULL OR vb.expires_at > now())
  LIMIT 1;
$$;
