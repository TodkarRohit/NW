-- 1. Create a public bucket for academic files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('academic-files', 'academic-files', true);

-- 2. Allow public access to read files
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'academic-files' );

-- 3. Allow anyone to upload new files
CREATE POLICY "Public Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'academic-files' );

-- 4. Allow anyone to update existing files (required for upsert: true)
CREATE POLICY "Public Update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'academic-files' );

-- 5. Allow anyone to delete files
CREATE POLICY "Public Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'academic-files' );
