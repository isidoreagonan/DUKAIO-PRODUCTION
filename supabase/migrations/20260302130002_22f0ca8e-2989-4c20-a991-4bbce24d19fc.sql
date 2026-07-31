
-- Store visits tracking
CREATE TABLE public.store_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_owner_id uuid NOT NULL,
  visitor_ip text,
  user_agent text,
  referrer text,
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_visits ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a visit (public tracking)
CREATE POLICY "Anyone can insert visits"
  ON public.store_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Owners can read their own visits
CREATE POLICY "Owners can read own visits"
  ON public.store_visits FOR SELECT
  TO authenticated
  USING (auth.uid() = store_owner_id);

-- Cart events tracking
CREATE TABLE public.cart_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_owner_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT 'add_to_cart',
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert cart events"
  ON public.cart_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Owners can read own cart events"
  ON public.cart_events FOR SELECT
  TO authenticated
  USING (auth.uid() = store_owner_id);

-- Payment events tracking
CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_owner_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'initiated',
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert payment events"
  ON public.payment_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Owners can read own payment events"
  ON public.payment_events FOR SELECT
  TO authenticated
  USING (auth.uid() = store_owner_id);
