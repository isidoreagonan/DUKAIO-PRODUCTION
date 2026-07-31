
-- Add store_logo_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_logo_url text;

-- Create course_lessons table for video lessons
CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  video_url text,
  video_type text DEFAULT 'external',
  position integer NOT NULL DEFAULT 0,
  duration_minutes integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Creators can manage their own lessons (via product ownership)
CREATE POLICY "Creators can manage own lessons"
  ON public.course_lessons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = course_lessons.product_id
      AND products.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = course_lessons.product_id
      AND products.creator_id = auth.uid()
    )
  );

-- Buyers can view lessons of published courses
CREATE POLICY "Anyone can view published course lessons"
  ON public.course_lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = course_lessons.product_id
      AND products.is_published = true
    )
  );
