-- Create ai_analysis_reports table
CREATE TABLE public.ai_analysis_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  analysis_type TEXT NOT NULL,
  analysis_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_level TEXT,
  confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated_reports table  
CREATE TABLE public.generated_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_analysis_reports
CREATE POLICY "Users can manage their AI analysis reports" 
ON public.ai_analysis_reports 
FOR ALL 
USING (profile_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

-- Create RLS policies for generated_reports
CREATE POLICY "Users can manage their generated reports" 
ON public.generated_reports 
FOR ALL 
USING (profile_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_ai_analysis_reports_updated_at
BEFORE UPDATE ON public.ai_analysis_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_reports_updated_at
BEFORE UPDATE ON public.generated_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();