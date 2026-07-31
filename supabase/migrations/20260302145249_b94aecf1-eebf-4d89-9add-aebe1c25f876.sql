
-- Withdrawals table
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  phone_number TEXT NOT NULL,
  operator TEXT NOT NULL DEFAULT 'mtn',
  status TEXT NOT NULL DEFAULT 'pending',
  moneroo_reference TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own withdrawals" ON public.withdrawals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals" ON public.withdrawals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add mobile money info to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS momo_phone TEXT,
  ADD COLUMN IF NOT EXISTS momo_operator TEXT DEFAULT 'mtn';
