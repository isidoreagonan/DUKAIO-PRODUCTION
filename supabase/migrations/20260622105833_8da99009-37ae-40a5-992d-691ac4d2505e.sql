
-- 1) Products: revoke download_url & file_password from anon/authenticated
REVOKE SELECT (download_url, file_password) ON public.products FROM anon, authenticated;

-- 2) Course lessons: revoke video_url from anon/authenticated
REVOKE SELECT (video_url) ON public.course_lessons FROM anon, authenticated;

-- 3) Profiles: revoke sensitive PII columns from anon
REVOKE SELECT (
  phone, contact, momo_phone, momo_operator,
  facebook_pixel_id, tiktok_pixel_id, google_ads_id,
  onboarding_completed, last_2fa_verified_at,
  first_name, last_name, country_code
) ON public.profiles FROM anon;

-- 4) Remove payment_events from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.payment_events;

-- 5) Telegram admin tables: add restrictive deny-all policies for anon/authenticated
DROP POLICY IF EXISTS "Deny all access to telegram_admin_chats" ON public.telegram_admin_chats;
CREATE POLICY "Deny all access to telegram_admin_chats"
  ON public.telegram_admin_chats AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Deny all access to telegram_bot_state" ON public.telegram_bot_state;
CREATE POLICY "Deny all access to telegram_bot_state"
  ON public.telegram_bot_state AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
