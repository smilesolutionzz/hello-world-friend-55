-- Create assessment_enhanced_analysis table for storing AI-powered results
CREATE TABLE IF NOT EXISTS public.assessment_enhanced_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  assessment_type TEXT NOT NULL,
  raw_results JSONB NOT NULL,
  enhanced_analysis TEXT NOT NULL,
  score_interpretation JSONB NOT NULL,
  recommendations TEXT[],
  risk_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assessment_enhanced_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment_enhanced_analysis
CREATE POLICY "Users can view their own enhanced analysis" 
ON public.assessment_enhanced_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enhanced analysis" 
ON public.assessment_enhanced_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enhanced analysis" 
ON public.assessment_enhanced_analysis 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_assessment_enhanced_analysis_user_id ON public.assessment_enhanced_analysis(user_id);
CREATE INDEX idx_assessment_enhanced_analysis_type ON public.assessment_enhanced_analysis(assessment_type);