
-- Create product_faqs table
CREATE TABLE public.product_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;

-- Anyone can read FAQs (for product pages)
CREATE POLICY "Anyone can read product FAQs"
ON public.product_faqs FOR SELECT
TO anon, authenticated
USING (true);

-- Only product owner can insert/update/delete
CREATE POLICY "Product owner can manage FAQs"
ON public.product_faqs FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = product_faqs.product_id
    AND products.creator_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = product_faqs.product_id
    AND products.creator_id = auth.uid()
  )
);

-- Add SEO columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
  ADD COLUMN IF NOT EXISTS seo_image_url TEXT;
