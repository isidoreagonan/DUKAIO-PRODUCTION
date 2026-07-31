-- Add moneroo transaction reference to payment_events
ALTER TABLE public.payment_events ADD COLUMN IF NOT EXISTS moneroo_transaction_id text;

-- Allow updates on payment_events (for webhook to update status)
CREATE POLICY "Anyone can update payment events by session"
ON public.payment_events
FOR UPDATE
USING (true);

-- Enable realtime for payment_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_events;