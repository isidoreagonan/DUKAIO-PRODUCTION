
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Customers can read own record" ON public.customers;
DROP POLICY IF EXISTS "Customers can update own record" ON public.customers;

CREATE POLICY "Anyone can insert customers" ON public.customers
FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Customers can read own record" ON public.customers
FOR SELECT TO authenticated
USING (auth_id = auth.uid());

CREATE POLICY "Customers can update own record" ON public.customers
FOR UPDATE TO authenticated
USING (auth_id = auth.uid());

-- Also fix orders insert policy
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

CREATE POLICY "Anyone can insert orders" ON public.orders
FOR INSERT TO public
WITH CHECK (true);
