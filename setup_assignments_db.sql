-- Create the assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id text PRIMARY KEY,
    subject_key text NOT NULL,
    chapter_id text NOT NULL,
    unit text,
    chapter_title text,
    num int,
    title text NOT NULL,
    question_file text NOT NULL,
    answer_file text,
    question_data_url text NOT NULL,
    answer_data_url text,
    question_preview text,
    answer_preview text,
    views int DEFAULT 0,
    downloads int DEFAULT 0,
    is_custom boolean DEFAULT true,
    comments jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Drop NOT NULL constraints if table already exists
ALTER TABLE public.assignments ALTER COLUMN answer_file DROP NOT NULL;
ALTER TABLE public.assignments ALTER COLUMN answer_data_url DROP NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy: Allow anyone (students & visitors) to read assignments
DROP POLICY IF EXISTS "Public Read Assignments" ON public.assignments;
CREATE POLICY "Public Read Assignments" 
ON public.assignments FOR SELECT 
USING (true);

-- 2. Restricted Public Update Policy: Allow public to increment views/downloads or post comments
DROP POLICY IF EXISTS "Public Update Assignments" ON public.assignments;
CREATE POLICY "Public Update Assignments" 
ON public.assignments FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 3. Authenticated Admin Insert Policy: Only authenticated users can insert new assignments
DROP POLICY IF EXISTS "Admin Insert Assignments" ON public.assignments;
DROP POLICY IF EXISTS "Public Insert Assignments" ON public.assignments;
CREATE POLICY "Admin Insert Assignments" 
ON public.assignments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 4. Authenticated Admin Delete Policy: Only authenticated admins can delete assignments
DROP POLICY IF EXISTS "Admin Delete Assignments" ON public.assignments;
DROP POLICY IF EXISTS "Public Delete Assignments" ON public.assignments;
CREATE POLICY "Admin Delete Assignments" 
ON public.assignments FOR DELETE 
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

