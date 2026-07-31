
-- Create stores table
CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  banner_url text,
  brand_color text DEFAULT '#6366f1',
  font text DEFAULT 'Inter',
  corner_style text DEFAULT 'rounded',
  button_animation text DEFAULT 'none',
  theme text DEFAULT 'feed',
  product_layout text DEFAULT 'grid-2',
  sort_order text DEFAULT 'recent',
  show_featured boolean DEFAULT true,
  show_recommended boolean DEFAULT true,
  show_buy_button boolean DEFAULT true,
  keywords text,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view active stores"
  ON public.stores FOR SELECT
  USING (is_archived = false);

CREATE POLICY "Owners can view all own stores"
  ON public.stores FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert own stores"
  ON public.stores FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own stores"
  ON public.stores FOR UPDATE
  USING (auth.uid() = owner_id);

-- No delete policy: stores can only be archived

-- Trigger to update updated_at
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to enforce max 3 active stores per user
CREATE OR REPLACE FUNCTION public.check_max_active_stores()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_archived = false THEN
    IF (
      SELECT count(*) FROM public.stores
      WHERE owner_id = NEW.owner_id AND is_archived = false AND id != NEW.id
    ) >= 3 THEN
      RAISE EXCEPTION 'Maximum of 3 active stores per user reached';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on insert and update
CREATE TRIGGER enforce_max_active_stores
  BEFORE INSERT OR UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_active_stores();
