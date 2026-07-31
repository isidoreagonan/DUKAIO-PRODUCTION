
-- Fix products table RLS policies (also restrictive)
DROP POLICY IF EXISTS "Published products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Creators can insert own products" ON public.products;
DROP POLICY IF EXISTS "Creators can update own products" ON public.products;
DROP POLICY IF EXISTS "Creators can delete own products" ON public.products;

CREATE POLICY "Published products are viewable by everyone"
  ON public.products FOR SELECT
  USING ((is_published = true) OR (auth.uid() = creator_id));

CREATE POLICY "Creators can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = creator_id);
