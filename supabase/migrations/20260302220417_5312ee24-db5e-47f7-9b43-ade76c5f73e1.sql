
-- Table des licences
CREATE TABLE public.licenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key text NOT NULL UNIQUE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  store_owner_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending_activation',
  max_activations integer NOT NULL DEFAULT 1,
  validity_days integer,
  activated_at timestamp with time zone,
  expires_at timestamp with time zone,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table des activations de licence
CREATE TABLE public.license_activations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id uuid NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  device_name text,
  ip_address text,
  user_agent text,
  is_active boolean NOT NULL DEFAULT true,
  activated_at timestamp with time zone NOT NULL DEFAULT now(),
  deactivated_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;

-- Policies for licenses
CREATE POLICY "Store owners can read their licenses"
ON public.licenses FOR SELECT TO authenticated
USING (auth.uid() = store_owner_id);

CREATE POLICY "Store owners can update their licenses"
ON public.licenses FOR UPDATE TO authenticated
USING (auth.uid() = store_owner_id);

-- System can insert licenses (via edge function with service_role)
CREATE POLICY "System can insert licenses"
ON public.licenses FOR INSERT
WITH CHECK (true);

-- Policies for license_activations
CREATE POLICY "Store owners can read activations"
ON public.license_activations FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.licenses l
  WHERE l.id = license_activations.license_id AND l.store_owner_id = auth.uid()
));

-- System can insert/update activations (via edge function)
CREATE POLICY "System can insert activations"
ON public.license_activations FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update activations"
ON public.license_activations FOR UPDATE
USING (true);

-- Indexes
CREATE INDEX idx_licenses_store_owner ON public.licenses(store_owner_id);
CREATE INDEX idx_licenses_product ON public.licenses(product_id);
CREATE INDEX idx_licenses_customer ON public.licenses(customer_id);
CREATE INDEX idx_licenses_key ON public.licenses(license_key);
CREATE INDEX idx_licenses_status ON public.licenses(status);
CREATE INDEX idx_license_activations_license ON public.license_activations(license_id);
CREATE INDEX idx_license_activations_device ON public.license_activations(device_id);

-- Function to generate a unique license key
CREATE OR REPLACE FUNCTION public.generate_license_key()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
  segment integer;
BEGIN
  FOR segment IN 1..4 LOOP
    IF segment > 1 THEN
      result := result || '-';
    END IF;
    FOR i IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  RETURN result;
END;
$$;
