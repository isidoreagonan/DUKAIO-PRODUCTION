
-- 1. PRODUCT REVIEWS
CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  store_owner_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  reviewer_name text NOT NULL,
  sentiment text NOT NULL CHECK (sentiment IN ('positive','negative')),
  title text,
  comment text NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, customer_id)
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read public product reviews"
  ON public.product_reviews FOR SELECT
  USING (is_public = true);

CREATE POLICY "Customers can read own product reviews"
  ON public.product_reviews FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.auth_id = auth.uid()));

CREATE POLICY "Store owner can read own product reviews"
  ON public.product_reviews FOR SELECT TO authenticated
  USING (auth.uid() = store_owner_id);

CREATE POLICY "Customers can create own product reviews"
  ON public.product_reviews FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_id
        AND c.auth_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.customer_id = c.id
            AND o.product_id = product_reviews.product_id
        )
    )
  );

CREATE POLICY "Customers can update own product reviews"
  ON public.product_reviews FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.auth_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.auth_id = auth.uid()));

CREATE POLICY "Customers can delete own product reviews"
  ON public.product_reviews FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.auth_id = auth.uid()));

CREATE INDEX idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_store ON public.product_reviews(store_owner_id);

-- Trigger: set metadata (store_owner_id, reviewer_name)
CREATE OR REPLACE FUNCTION public.set_product_review_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
  v_name text;
BEGIN
  SELECT creator_id INTO v_owner_id FROM public.products WHERE id = NEW.product_id;
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Produit introuvable';
  END IF;
  SELECT name INTO v_name FROM public.customers WHERE id = NEW.customer_id;
  IF v_name IS NULL THEN
    RAISE EXCEPTION 'Client introuvable';
  END IF;
  NEW.store_owner_id := v_owner_id;
  NEW.reviewer_name := v_name;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_product_review_meta
  BEFORE INSERT OR UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_product_review_metadata();

-- 2. KYC verified status helper (for blue badge)
-- Public function to check if a customer's linked auth user has approved KYC
CREATE OR REPLACE FUNCTION public.customer_has_kyc(_customer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.customers c
    JOIN public.identity_verifications iv ON iv.user_id = c.auth_id
    WHERE c.id = _customer_id
      AND iv.status = 'approved'
  );
$$;

GRANT EXECUTE ON FUNCTION public.customer_has_kyc(uuid) TO anon, authenticated;

-- 3. SUPPORT TICKETS (per-order)
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  store_owner_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can read own tickets"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.auth_id = auth.uid()));

CREATE POLICY "Store owners can read tickets on own products"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = store_owner_id);

CREATE POLICY "Customers can create tickets for own orders"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      JOIN public.orders o ON o.customer_id = c.id
      WHERE c.id = customer_id
        AND c.auth_id = auth.uid()
        AND o.id = order_id
    )
  );

CREATE POLICY "Owner can update tickets"
  ON public.support_tickets FOR UPDATE TO authenticated
  USING (auth.uid() = store_owner_id OR EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.auth_id = auth.uid()));

CREATE TABLE public.support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer','seller')),
  sender_id uuid,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read messages"
  ON public.support_ticket_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id
        AND (t.store_owner_id = auth.uid()
             OR EXISTS (SELECT 1 FROM public.customers c WHERE c.id = t.customer_id AND c.auth_id = auth.uid()))
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.support_ticket_messages FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id
        AND (
          (sender_type = 'seller' AND t.store_owner_id = auth.uid())
          OR (sender_type = 'customer' AND EXISTS (SELECT 1 FROM public.customers c WHERE c.id = t.customer_id AND c.auth_id = auth.uid()))
        )
    )
  );

CREATE INDEX idx_support_tickets_customer ON public.support_tickets(customer_id);
CREATE INDEX idx_support_tickets_owner ON public.support_tickets(store_owner_id);
CREATE INDEX idx_support_messages_ticket ON public.support_ticket_messages(ticket_id);

CREATE TRIGGER trg_support_tickets_updated
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
