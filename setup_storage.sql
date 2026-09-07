-- 1. Create a public bucket for academic files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('academic-files', 'academic-files', true);

-- 2. Allow public access to read files (SELECT)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'academic-files' );

-- 3. Drop all public write policies (INSERT, UPDATE, DELETE)
-- Storage uploads/edits/deletions MUST go through Express backend service_role key
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
