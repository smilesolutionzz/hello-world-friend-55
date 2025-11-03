-- Create content calendar table for institutions
CREATE TABLE IF NOT EXISTS public.institution_content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  date TEXT NOT NULL,
  channel TEXT NOT NULL,
  topic TEXT NOT NULL,
  content_type TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institution_content_calendar ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Institutions can view their own content calendar"
ON public.institution_content_calendar
FOR SELECT
USING (auth.uid() = institution_id);

CREATE POLICY "Institutions can create their own content calendar"
ON public.institution_content_calendar
FOR INSERT
WITH CHECK (auth.uid() = institution_id);

CREATE POLICY "Institutions can update their own content calendar"
ON public.institution_content_calendar
FOR UPDATE
USING (auth.uid() = institution_id);

CREATE POLICY "Institutions can delete their own content calendar"
ON public.institution_content_calendar
FOR DELETE
USING (auth.uid() = institution_id);

-- Trigger for updated_at
CREATE TRIGGER update_institution_content_calendar_updated_at
BEFORE UPDATE ON public.institution_content_calendar
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for better performance
CREATE INDEX idx_content_calendar_institution ON public.institution_content_calendar(institution_id);
CREATE INDEX idx_content_calendar_date ON public.institution_content_calendar(date);