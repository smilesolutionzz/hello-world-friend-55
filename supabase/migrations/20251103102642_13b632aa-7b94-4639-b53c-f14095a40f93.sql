-- Drop the existing foreign key constraint
ALTER TABLE public.institution_content_calendar 
DROP CONSTRAINT IF EXISTS institution_content_calendar_institution_id_fkey;

-- Add foreign key to auth.users instead of profiles
ALTER TABLE public.institution_content_calendar
ADD CONSTRAINT institution_content_calendar_institution_id_fkey 
FOREIGN KEY (institution_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;