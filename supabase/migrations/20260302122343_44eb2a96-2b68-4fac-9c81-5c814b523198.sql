
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  store_slug TEXT UNIQUE,
  store_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Users can insert own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Products table
CREATE TYPE public.product_type AS ENUM ('file', 'course', 'license', 'bundle');

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2),
  type product_type NOT NULL DEFAULT 'file',
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  download_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view published products
CREATE POLICY "Published products are viewable by everyone"
ON public.products FOR SELECT
USING (is_published = true OR auth.uid() = creator_id);

-- Creators can insert own products
CREATE POLICY "Creators can insert own products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

-- Creators can update own products
CREATE POLICY "Creators can update own products"
ON public.products FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id);

-- Creators can delete own products
CREATE POLICY "Creators can delete own products"
ON public.products FOR DELETE
TO authenticated
USING (auth.uid() = creator_id);

-- Storage bucket for product thumbnails and avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('product-assets', 'product-assets', true);

CREATE POLICY "Anyone can view product assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-assets');

CREATE POLICY "Authenticated users can upload product assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-assets');

CREATE POLICY "Users can update own product assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-assets');

CREATE POLICY "Users can delete own product assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-assets');
