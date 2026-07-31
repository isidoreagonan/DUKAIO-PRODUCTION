
-- Migrate existing profile store data into the stores table
-- Only for users who had a store_slug set and don't already have a store
INSERT INTO public.stores (owner_id, name, slug, description, logo_url, banner_url, brand_color, font, corner_style, button_animation, show_featured, show_buy_button, show_recommended, product_layout, sort_order, theme, keywords)
SELECT 
  p.id,
  COALESCE(p.display_name, 'Ma Boutique'),
  p.store_slug,
  p.store_description,
  p.store_logo_url,
  p.store_banner_url,
  COALESCE(p.store_brand_color, '#6366f1'),
  COALESCE(p.store_font, 'Inter'),
  COALESCE(p.store_corner_style, 'rounded'),
  COALESCE(p.store_button_animation, 'none'),
  COALESCE(p.store_show_featured, true),
  COALESCE(p.store_show_buy_button, true),
  COALESCE(p.store_show_recommended, true),
  COALESCE(p.store_product_layout, 'grid-2'),
  COALESCE(p.store_sort_order, 'recent'),
  COALESCE(p.store_theme, 'feed'),
  p.store_keywords
FROM public.profiles p
WHERE p.store_slug IS NOT NULL
  AND p.store_slug != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.stores s WHERE s.owner_id = p.id AND s.slug = p.store_slug
  );
