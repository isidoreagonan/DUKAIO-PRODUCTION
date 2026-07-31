-- Drop existing permissive ALL policy and replace with explicit per-command deny policies
DROP POLICY IF EXISTS "System manages login_otps" ON public.login_otps;

-- Ensure RLS is enabled and forced (applies even to table owner via API)
ALTER TABLE public.login_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_otps FORCE ROW LEVEL SECURITY;

-- Revoke any direct grants from API roles (service_role bypasses RLS entirely)
REVOKE ALL ON public.login_otps FROM anon, authenticated, public;

-- Explicit deny policies for clarity to scanners (no role can SELECT/INSERT/UPDATE/DELETE via PostgREST)
CREATE POLICY "Deny select to anon and authenticated"
ON public.login_otps
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "Deny insert to anon and authenticated"
ON public.login_otps
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Deny update to anon and authenticated"
ON public.login_otps
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny delete to anon and authenticated"
ON public.login_otps
FOR DELETE
TO anon, authenticated
USING (false);