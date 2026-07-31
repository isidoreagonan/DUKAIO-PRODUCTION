-- Drop community tables (cascade removes RLS, indexes, foreign refs)
DROP TABLE IF EXISTS public.community_post_comments CASCADE;
DROP TABLE IF EXISTS public.community_post_likes CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.community_messages CASCADE;
DROP TABLE IF EXISTS public.community_channels CASCADE;
DROP TABLE IF EXISTS public.community_resources CASCADE;
DROP TABLE IF EXISTS public.community_events CASCADE;
DROP TABLE IF EXISTS public.community_memberships CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;

-- Drop helper functions
DROP FUNCTION IF EXISTS public.is_active_community_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_community_creator(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_post_likes_count() CASCADE;

-- Remove community pricing columns from products
ALTER TABLE public.products
  DROP COLUMN IF EXISTS community_price_monthly,
  DROP COLUMN IF EXISTS community_price_yearly,
  DROP COLUMN IF EXISTS community_price_one_time;

-- Delete any community-typed products before removing enum value
DELETE FROM public.products WHERE type = 'community';

-- Recreate product_type enum without 'community'
ALTER TYPE public.product_type RENAME TO product_type_old;
CREATE TYPE public.product_type AS ENUM ('file', 'course', 'license');
ALTER TABLE public.products
  ALTER COLUMN type DROP DEFAULT,
  ALTER COLUMN type TYPE public.product_type USING type::text::public.product_type,
  ALTER COLUMN type SET DEFAULT 'file'::public.product_type;
DROP TYPE public.product_type_old;