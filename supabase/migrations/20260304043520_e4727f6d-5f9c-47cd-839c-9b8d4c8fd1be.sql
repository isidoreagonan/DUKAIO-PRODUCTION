-- Create storage bucket for store builder assets
INSERT INTO storage.buckets (id, name, public) VALUES ('store-assets', 'store-assets', true) ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload to their own folder
CREATE POLICY "Users can upload store assets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'store-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: anyone can view store assets (public bucket)
CREATE POLICY "Anyone can view store assets" ON storage.objects
FOR SELECT USING (bucket_id = 'store-assets');

-- RLS: users can delete their own assets
CREATE POLICY "Users can delete own store assets" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'store-assets' AND (storage.foldername(name))[1] = auth.uid()::text);