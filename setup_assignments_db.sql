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
    answer_file text NOT NULL,
    question_data_url text NOT NULL,
    answer_data_url text NOT NULL,
    question_preview text,
    answer_preview text,
    views int DEFAULT 0,
    downloads int DEFAULT 0,
    is_custom boolean DEFAULT true,
    comments jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Allow public access to read assignments
CREATE POLICY "Public Read Assignments" 
ON public.assignments FOR SELECT 
USING (true);

-- Allow public to insert (since the UI handles admin check locally for now)
CREATE POLICY "Public Insert Assignments" 
ON public.assignments FOR INSERT 
WITH CHECK (true);

-- Allow public to update (for comments, views, downloads)
CREATE POLICY "Public Update Assignments" 
ON public.assignments FOR UPDATE 
USING (true);

-- Allow public to delete (since UI handles admin check)
CREATE POLICY "Public Delete Assignments" 
ON public.assignments FOR DELETE 
USING (true);
