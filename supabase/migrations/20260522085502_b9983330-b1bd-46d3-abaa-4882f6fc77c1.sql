
-- ============================================================
-- 1) buyer_otps : remove public ALL policy, deny anon/auth
-- ============================================================
DROP POLICY IF EXISTS "System can manage buyer otps" ON public.buyer_otps;

CREATE POLICY "Deny select buyer_otps" ON public.buyer_otps
  FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny insert buyer_otps" ON public.buyer_otps
  FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny update buyer_otps" ON public.buyer_otps
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny delete buyer_otps" ON public.buyer_otps
  FOR DELETE TO anon, authenticated USING (false);

-- ============================================================
-- 2) products : hide download_url & file_password from anon
-- ============================================================
REVOKE SELECT (download_url, file_password) ON public.products FROM anon;

-- ============================================================
-- 3) profiles : hide sensitive contact / tracking fields from anon
-- ============================================================
REVOKE SELECT (
  phone, momo_phone, momo_operator, contact,
  facebook_pixel_id, tiktok_pixel_id, google_ads_id,
  onboarding_completed, last_2fa_verified_at
) ON public.profiles FROM anon;

-- ============================================================
-- 4) notifications : restrict INSERT to self or service role
-- ============================================================
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Users insert own notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5) license_activations : remove unrestricted public INSERT/UPDATE
-- ============================================================
DROP POLICY IF EXISTS "System can insert activations" ON public.license_activations;
DROP POLICY IF EXISTS "System can update activations" ON public.license_activations;

-- (Service role bypasses RLS so edge functions still work)

-- ============================================================
-- 6) payment_events : remove unrestricted public UPDATE
-- ============================================================
DROP POLICY IF EXISTS "Anyone can update payment events by session" ON public.payment_events;

-- ============================================================
-- 7) Remove identity_verifications from realtime publication
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'identity_verifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.identity_verifications';
  END IF;
END $$;
