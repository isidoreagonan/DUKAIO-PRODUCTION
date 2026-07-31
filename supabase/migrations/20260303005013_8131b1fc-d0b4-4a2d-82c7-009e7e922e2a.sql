-- Allow product creators to delete related orders
CREATE POLICY "Creators can delete orders for own products"
ON public.orders
FOR DELETE
USING (auth.uid() = store_owner_id);

-- Allow product creators to delete related licenses
CREATE POLICY "Creators can delete own licenses"
ON public.licenses
FOR DELETE
USING (auth.uid() = store_owner_id);

-- Allow deletion of license activations linked to own licenses
CREATE POLICY "Creators can delete activations for own licenses"
ON public.license_activations
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.licenses l
  WHERE l.id = license_activations.license_id AND l.store_owner_id = auth.uid()
));

-- Allow creators to delete own cart events
CREATE POLICY "Creators can delete own cart events"
ON public.cart_events
FOR DELETE
USING (auth.uid() = store_owner_id);

-- Allow creators to delete own payment events
CREATE POLICY "Creators can delete own payment events"
ON public.payment_events
FOR DELETE
USING (auth.uid() = store_owner_id);