-- Anti-recursion helper for customers RLS
CREATE OR REPLACE FUNCTION public.customer_has_order_with_store(_customer_id uuid, _store_owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.customer_id = _customer_id
      AND o.store_owner_id = _store_owner_id
  );
$$;

-- Replace recursive policy with function-based policy
DROP POLICY IF EXISTS "Store owners can read their customers" ON public.customers;

CREATE POLICY "Store owners can read their customers"
ON public.customers
FOR SELECT
TO authenticated
USING (public.customer_has_order_with_store(customers.id, auth.uid()));