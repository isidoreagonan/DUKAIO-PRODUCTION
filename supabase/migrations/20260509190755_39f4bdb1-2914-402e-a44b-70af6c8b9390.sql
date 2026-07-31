-- Add Moneroo payout tracking column
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS moneroo_payout_id TEXT;
CREATE INDEX IF NOT EXISTS withdrawals_moneroo_payout_id_idx ON public.withdrawals(moneroo_payout_id);
CREATE INDEX IF NOT EXISTS orders_moneroo_transaction_id_idx ON public.orders(moneroo_transaction_id);