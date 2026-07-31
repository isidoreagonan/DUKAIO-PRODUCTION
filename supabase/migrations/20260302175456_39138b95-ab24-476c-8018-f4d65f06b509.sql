
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS store_theme text DEFAULT 'feed',
ADD COLUMN IF NOT EXISTS store_brand_color text DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS store_font text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS store_corner_style text DEFAULT 'rounded',
ADD COLUMN IF NOT EXISTS store_button_animation text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS store_show_featured boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS store_show_buy_button boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS store_show_recommended boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS store_product_layout text DEFAULT 'grid-2',
ADD COLUMN IF NOT EXISTS store_sort_order text DEFAULT 'recent';
