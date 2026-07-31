DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_sentiment') THEN
    CREATE TYPE public.review_sentiment AS ENUM ('positive', 'negative');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_report_status') THEN
    CREATE TYPE public.product_report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'actioned');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_moderation_status') THEN
    CREATE TYPE public.product_moderation_status AS ENUM ('approved', 'warning', 'rejected');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.store_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  store_owner_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  sentiment public.review_sentiment NOT NULL,
  title TEXT,
  comment TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, customer_id)
);

CREATE TABLE IF NOT EXISTS public.product_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_owner_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status public.product_report_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, customer_id)
);

CREATE TABLE IF NOT EXISTS public.product_moderation_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  status public.product_moderation_status NOT NULL DEFAULT 'warning',
  summary TEXT NOT NULL,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_fixes JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_store_reviews_store_id_created_at
  ON public.store_reviews(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_reviews_store_owner_id
  ON public.store_reviews(store_owner_id);
CREATE INDEX IF NOT EXISTS idx_product_reports_product_id_created_at
  ON public.product_reports(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_reports_store_owner_id
  ON public.product_reports(store_owner_id);
CREATE INDEX IF NOT EXISTS idx_product_moderation_reviews_product_id_reviewed_at
  ON public.product_moderation_reviews(product_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_moderation_reviews_creator_id
  ON public.product_moderation_reviews(creator_id);

CREATE OR REPLACE FUNCTION public.set_store_review_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_reviewer_name TEXT;
BEGIN
  SELECT s.owner_id INTO v_owner_id
  FROM public.stores s
  WHERE s.id = NEW.store_id
    AND s.is_archived = false;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Boutique introuvable';
  END IF;

  SELECT c.name INTO v_reviewer_name
  FROM public.customers c
  WHERE c.id = NEW.customer_id;

  IF v_reviewer_name IS NULL THEN
    RAISE EXCEPTION 'Client introuvable';
  END IF;

  NEW.store_owner_id := v_owner_id;
  NEW.reviewer_name := v_reviewer_name;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_product_report_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_reporter_name TEXT;
BEGIN
  SELECT p.creator_id INTO v_owner_id
  FROM public.products p
  WHERE p.id = NEW.product_id
    AND p.is_published = true;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Produit introuvable ou non publié';
  END IF;

  SELECT c.name INTO v_reporter_name
  FROM public.customers c
  WHERE c.id = NEW.customer_id;

  IF v_reporter_name IS NULL THEN
    RAISE EXCEPTION 'Client introuvable';
  END IF;

  NEW.store_owner_id := v_owner_id;
  NEW.reporter_name := v_reporter_name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_store_review_metadata_trigger ON public.store_reviews;
CREATE TRIGGER set_store_review_metadata_trigger
BEFORE INSERT OR UPDATE ON public.store_reviews
FOR EACH ROW
EXECUTE FUNCTION public.set_store_review_metadata();

DROP TRIGGER IF EXISTS update_store_reviews_updated_at ON public.store_reviews;
CREATE TRIGGER update_store_reviews_updated_at
BEFORE UPDATE ON public.store_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_product_report_metadata_trigger ON public.product_reports;
CREATE TRIGGER set_product_report_metadata_trigger
BEFORE INSERT OR UPDATE ON public.product_reports
FOR EACH ROW
EXECUTE FUNCTION public.set_product_report_metadata();

DROP TRIGGER IF EXISTS update_product_reports_updated_at ON public.product_reports;
CREATE TRIGGER update_product_reports_updated_at
BEFORE UPDATE ON public.product_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_moderation_reviews_updated_at ON public.product_moderation_reviews;
CREATE TRIGGER update_product_moderation_reviews_updated_at
BEFORE UPDATE ON public.product_moderation_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_moderation_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visible store reviews" ON public.store_reviews;
CREATE POLICY "Public can read visible store reviews"
ON public.store_reviews
FOR SELECT
TO public
USING (is_public = true);

DROP POLICY IF EXISTS "Customers can read own store reviews" ON public.store_reviews;
CREATE POLICY "Customers can read own store reviews"
ON public.store_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.id = store_reviews.customer_id
      AND c.auth_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Customers can create own store reviews" ON public.store_reviews;
CREATE POLICY "Customers can create own store reviews"
ON public.store_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.id = customer_id
      AND c.auth_id = auth.uid()
      AND public.customer_has_order_with_store(c.id, store_owner_id)
  )
);

DROP POLICY IF EXISTS "Customers can update own store reviews" ON public.store_reviews;
CREATE POLICY "Customers can update own store reviews"
ON public.store_reviews
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.id = store_reviews.customer_id
      AND c.auth_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.id = customer_id
      AND c.auth_id = auth.uid()
      AND public.customer_has_order_with_store(c.id, store_owner_id)
  )
);

DROP POLICY IF EXISTS "Customers can delete own store reviews" ON public.store_reviews;
CREATE POLICY "Customers can delete own store reviews"
ON public.store_reviews
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.id = store_reviews.customer_id
      AND c.auth_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Customers can create own product reports" ON public.product_reports;
CREATE POLICY "Customers can create own product reports"
ON public.product_reports
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.id = customer_id
      AND c.auth_id = auth.uid()
      AND public.customer_has_order_with_store(c.id, store_owner_id)
  )
);

DROP POLICY IF EXISTS "Customers can read own product reports" ON public.product_reports;
CREATE POLICY "Customers can read own product reports"
ON public.product_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.id = product_reports.customer_id
      AND c.auth_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Customers can update own product reports" ON public.product_reports;
CREATE POLICY "Customers can update own product reports"
ON public.product_reports
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.id = product_reports.customer_id
      AND c.auth_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.customers c
    WHERE c.id = customer_id
      AND c.auth_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Creators can manage own moderation reviews" ON public.product_moderation_reviews;
CREATE POLICY "Creators can manage own moderation reviews"
ON public.product_moderation_reviews
FOR ALL
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);