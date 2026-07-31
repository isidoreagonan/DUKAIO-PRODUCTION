-- 1. Add category column to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS sales_count INTEGER NOT NULL DEFAULT 0;

-- 2. Index for marketplace queries
CREATE INDEX IF NOT EXISTS idx_products_published_category
  ON public.products (is_published, category);

CREATE INDEX IF NOT EXISTS idx_products_published_sales
  ON public.products (is_published, sales_count DESC);

CREATE INDEX IF NOT EXISTS idx_products_published_created
  ON public.products (is_published, created_at DESC);

-- 3. Full-text search index (title + description)
CREATE INDEX IF NOT EXISTS idx_products_search_fts
  ON public.products
  USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '')));

-- 4. Trigger to auto-increment sales_count when an order is completed
CREATE OR REPLACE FUNCTION public.increment_product_sales_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE public.products
    SET sales_count = sales_count + 1
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_product_sales ON public.orders;
CREATE TRIGGER trg_increment_product_sales
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_product_sales_count();

-- 5. Backfill sales_count for existing completed orders
UPDATE public.products p
SET sales_count = sub.cnt
FROM (
  SELECT product_id, COUNT(*)::int AS cnt
  FROM public.orders
  WHERE status = 'completed'
  GROUP BY product_id
) sub
WHERE p.id = sub.product_id;