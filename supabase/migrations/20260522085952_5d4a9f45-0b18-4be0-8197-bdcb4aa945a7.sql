
-- 1) course_lessons: restrict public access to video_url
DROP POLICY IF EXISTS "Anyone can view published course lessons" ON public.course_lessons;
CREATE POLICY "Anyone can view published course lessons"
ON public.course_lessons
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = course_lessons.product_id AND products.is_published = true
  )
);
REVOKE SELECT (video_url) ON public.course_lessons FROM anon, authenticated;
GRANT SELECT (video_url) ON public.course_lessons TO service_role;

-- 2) licenses: remove permissive public INSERT
DROP POLICY IF EXISTS "System can insert licenses" ON public.licenses;

-- 3) webhook_logs: remove permissive public INSERT
DROP POLICY IF EXISTS "System can insert webhook logs" ON public.webhook_logs;

-- 4) products: revoke sensitive columns from anon and authenticated (service_role handles delivery)
REVOKE SELECT (download_url, file_password) ON public.products FROM anon, authenticated;
GRANT SELECT (download_url, file_password) ON public.products TO service_role;

-- 5) profiles: revoke sensitive columns from anon
REVOKE SELECT (phone, contact, momo_phone, momo_operator, facebook_pixel_id, tiktok_pixel_id, google_ads_id, onboarding_completed, last_2fa_verified_at)
ON public.profiles FROM anon;

-- 6) product-assets storage policies: enforce ownership
DROP POLICY IF EXISTS "Authenticated users can upload product assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own product assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product assets" ON storage.objects;

CREATE POLICY "Users can upload own product assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-assets'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR (storage.foldername(name))[2] = (auth.uid())::text
  )
);

CREATE POLICY "Users can update own product assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-assets'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR (storage.foldername(name))[2] = (auth.uid())::text
  )
)
WITH CHECK (
  bucket_id = 'product-assets'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR (storage.foldername(name))[2] = (auth.uid())::text
  )
);

CREATE POLICY "Users can delete own product assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-assets'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR (storage.foldername(name))[2] = (auth.uid())::text
  )
);
