-- 1. Create a public bucket for academic files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('academic-files', 'academic-files', true);

-- 2. Allow public access to read files
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'academic-files' );

-- 3. Allow anyone to upload files for now (since our custom auth uses a public user table, not true Supabase Auth)
-- We will handle admin checks in the frontend before uploading
CREATE POLICY "Public Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'academic-files' );
