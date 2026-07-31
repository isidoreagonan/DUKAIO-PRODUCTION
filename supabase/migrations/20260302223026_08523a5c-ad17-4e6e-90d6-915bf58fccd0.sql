
-- Add country and device_type columns to store_visits for analytics
ALTER TABLE public.store_visits
ADD COLUMN country text DEFAULT NULL,
ADD COLUMN device_type text DEFAULT NULL;

-- Index for analytics queries
CREATE INDEX idx_store_visits_country ON public.store_visits(store_owner_id, country);
CREATE INDEX idx_store_visits_device ON public.store_visits(store_owner_id, device_type);
