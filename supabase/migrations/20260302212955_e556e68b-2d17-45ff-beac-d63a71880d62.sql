-- Allow store owners to read customers who have purchased from them
CREATE POLICY "Store owners can read their customers"
ON public.customers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.customer_id = customers.id
    AND orders.store_owner_id = auth.uid()
  )
);
