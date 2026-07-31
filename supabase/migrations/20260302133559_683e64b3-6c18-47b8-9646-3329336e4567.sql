
-- Table for buyer customers (linked to auth via OTP)
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint on email
CREATE UNIQUE INDEX customers_email_unique ON public.customers(email);
-- Index for auth lookup
CREATE INDEX customers_auth_id_idx ON public.customers(auth_id);

-- Orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_owner_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX orders_customer_id_idx ON public.orders(customer_id);
CREATE INDEX orders_store_owner_id_idx ON public.orders(store_owner_id);

-- RLS for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers can read their own record (via auth)
CREATE POLICY "Customers can read own record" ON public.customers
  FOR SELECT USING (auth.uid() = auth_id);

-- Anyone can insert (during checkout)
CREATE POLICY "Anyone can insert customers" ON public.customers
  FOR INSERT WITH CHECK (true);

-- Customers can update their own record
CREATE POLICY "Customers can update own record" ON public.customers
  FOR UPDATE USING (auth.uid() = auth_id);

-- RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can read their own orders
CREATE POLICY "Customers can read own orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.customers c 
      WHERE c.id = orders.customer_id AND c.auth_id = auth.uid()
    )
  );

-- Store owners can read orders for their store
CREATE POLICY "Store owners can read their orders" ON public.orders
  FOR SELECT USING (auth.uid() = store_owner_id);

-- Anyone can insert orders (during checkout)
CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);
