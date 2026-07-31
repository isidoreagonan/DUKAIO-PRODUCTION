
-- Table pour stocker les configurations de webhooks des vendeurs
CREATE TABLE public.webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  secret text,
  events text[] NOT NULL DEFAULT '{}',
  product_ids uuid[] DEFAULT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table pour les logs de livraison webhook
CREATE TABLE public.webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id uuid NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  response_status integer,
  response_body text,
  success boolean NOT NULL DEFAULT false,
  attempt integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policies for webhooks
CREATE POLICY "Creators can manage own webhooks"
ON public.webhooks FOR ALL TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Policies for webhook_logs
CREATE POLICY "Creators can read own webhook logs"
ON public.webhook_logs FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.webhooks w
  WHERE w.id = webhook_logs.webhook_id AND w.creator_id = auth.uid()
));

-- Allow system to insert logs (via edge function with service_role)
CREATE POLICY "System can insert webhook logs"
ON public.webhook_logs FOR INSERT
WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_webhooks_creator ON public.webhooks(creator_id);
CREATE INDEX idx_webhook_logs_webhook ON public.webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created ON public.webhook_logs(created_at DESC);
