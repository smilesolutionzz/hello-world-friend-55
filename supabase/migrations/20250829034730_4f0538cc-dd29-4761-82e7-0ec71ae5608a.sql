-- Create timeline_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.timeline_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID,
  member_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  score_overall INTEGER,
  tags TEXT[],
  files JSONB DEFAULT '[]',
  actor JSONB,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on timeline_activities
ALTER TABLE public.timeline_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for timeline_activities
CREATE POLICY "Users can view their own timeline activities" 
ON public.timeline_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = member_id AND p.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM family_members fm 
    WHERE fm.id = member_id AND fm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own timeline activities" 
ON public.timeline_activities 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = member_id AND p.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM family_members fm 
    WHERE fm.id = member_id AND fm.user_id = auth.uid()
  )
);

-- Add missing columns to assessments table
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS family_id UUID,
ADD COLUMN IF NOT EXISTS recommendations TEXT[];

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_timeline_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timeline_activities_updated_at
BEFORE UPDATE ON public.timeline_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_timeline_activities_updated_at();