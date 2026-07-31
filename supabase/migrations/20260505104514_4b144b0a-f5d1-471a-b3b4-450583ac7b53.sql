-- Add pawapay tracking columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pawapay_deposit_id text;
CREATE INDEX IF NOT EXISTS orders_pawapay_deposit_id_idx ON public.orders(pawapay_deposit_id);

ALTER TABLE public.payment_events ADD COLUMN IF NOT EXISTS pawapay_deposit_id text;
CREATE INDEX IF NOT EXISTS payment_events_pawapay_deposit_id_idx ON public.payment_events(pawapay_deposit_id);

ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS pawapay_payout_id text;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS provider_code text;
CREATE INDEX IF NOT EXISTS withdrawals_pawapay_payout_id_idx ON public.withdrawals(pawapay_payout_id);

-- Allow service_role realtime updates for payment_events
ALTER TABLE public.payment_events REPLICA IDENTITY FULL;