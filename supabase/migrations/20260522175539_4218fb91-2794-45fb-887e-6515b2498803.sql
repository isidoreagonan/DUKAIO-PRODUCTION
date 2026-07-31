
-- 1. Drop overly permissive INSERT policies (use service-role edge functions instead)
DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert payment events" ON public.payment_events;
DROP POLICY IF EXISTS "Users insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;

-- 2. Restrict telegram_messages — block all client access (table is service-role only)
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny all client access to telegram_messages" ON public.telegram_messages;
CREATE POLICY "Deny all client access to telegram_messages"
  ON public.telegram_messages
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
-- Remove from realtime publication (raw Telegram payloads must not be broadcast)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'telegram_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.telegram_messages';
  END IF;
END$$;

-- 3. Column-level REVOKE: hide sensitive product fields from clients (anon + authenticated).
--    Creators access via dashboard which can be migrated to RPC; for now, expose via secure RPC.
REVOKE SELECT (download_url, file_password) ON public.products FROM anon, authenticated;

-- Secure RPC for product creators to read their own download_url / file_password
CREATE OR REPLACE FUNCTION public.get_my_product_secrets(_product_id uuid)
RETURNS TABLE(download_url text, file_password text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.download_url, p.file_password
  FROM public.products p
  WHERE p.id = _product_id AND p.creator_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.get_my_product_secrets(uuid) TO authenticated;

-- 4. Course lessons: hide video_url from public; expose via service-role edge function after order verification
REVOKE SELECT (video_url) ON public.course_lessons FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_lesson_video(_lesson_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT cl.video_url
  FROM public.course_lessons cl
  JOIN public.products p ON p.id = cl.product_id
  WHERE cl.id = _lesson_id AND p.creator_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.get_my_lesson_video(uuid) TO authenticated;

-- 5. Profiles: hide sensitive PII from anonymous public reads.
--    Keep public access to storefront-safe columns. Revoke sensitive cols from anon.
REVOKE SELECT (
  phone, contact, momo_phone, momo_operator,
  facebook_pixel_id, tiktok_pixel_id, google_ads_id,
  onboarding_completed, last_2fa_verified_at,
  first_name, last_name, country_code
) ON public.profiles FROM anon;

-- Secure RPC for owners to read their own complete profile (works even after revokes)
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
