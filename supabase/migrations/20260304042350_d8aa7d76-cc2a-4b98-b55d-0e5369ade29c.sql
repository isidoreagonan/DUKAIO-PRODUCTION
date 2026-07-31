ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS layout_sections jsonb NOT NULL DEFAULT '[
  {"type":"hero","enabled":true,"position":0,"config":{"title":"","subtitle":"","show_banner":true}},
  {"type":"benefits","enabled":false,"position":1,"config":{"items":[]}},
  {"type":"featured_products","enabled":true,"position":2,"config":{"title":"Produits en vedette","count":4}},
  {"type":"products_grid","enabled":true,"position":3,"config":{"title":"Tous les produits"}},
  {"type":"about","enabled":false,"position":4,"config":{"title":"À propos","content":""}},
  {"type":"testimonials","enabled":false,"position":5,"config":{"items":[]}},
  {"type":"video","enabled":false,"position":6,"config":{"title":"","video_url":"","video_type":"youtube"}},
  {"type":"faq","enabled":false,"position":7,"config":{"title":"Questions fréquentes","items":[]}},
  {"type":"banner_promo","enabled":false,"position":8,"config":{"title":"","subtitle":"","cta_text":"","cta_url":"","bg_color":""}},
  {"type":"gallery","enabled":false,"position":9,"config":{"title":"Galerie","images":[]}},
  {"type":"counter","enabled":false,"position":10,"config":{"items":[]}},
  {"type":"partners","enabled":false,"position":11,"config":{"title":"Nos partenaires","logos":[]}},
  {"type":"newsletter","enabled":false,"position":12,"config":{"title":"Newsletter","subtitle":"Recevez nos dernières offres"}}
]'::jsonb;