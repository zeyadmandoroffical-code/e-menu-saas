-- Supabase Storage Buckets and Policies for E-Menu SaaS

-- 1. Create Public Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-media', 'restaurant-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-media', 'menu-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for Public Access & Uploads
CREATE POLICY "Public Read restaurant-media" ON storage.objects
FOR SELECT USING (bucket_id = 'restaurant-media');

CREATE POLICY "Public Upload restaurant-media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'restaurant-media');

CREATE POLICY "Public Update restaurant-media" ON storage.objects
FOR UPDATE USING (bucket_id = 'restaurant-media');

CREATE POLICY "Public Read menu-media" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-media');

CREATE POLICY "Public Upload menu-media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'menu-media');

CREATE POLICY "Public Update menu-media" ON storage.objects
FOR UPDATE USING (bucket_id = 'menu-media');
