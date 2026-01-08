-- Create table for AI observation analysis results (video, audio, text)
CREATE TABLE public.ai_observation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL, -- child_behavior, language_delay, autism_screening, adult_psychology, elderly_cognitive, motor_function
  input_type TEXT NOT NULL, -- video, audio, text
  input_context TEXT, -- User's observation context/concern
  age_group TEXT,
  analysis_result JSONB NOT NULL,
  risk_level TEXT, -- low, medium, high
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_observation_results ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own observation results" 
ON public.ai_observation_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own observation results" 
ON public.ai_observation_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observation results" 
ON public.ai_observation_results 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_ai_observation_results_user_id ON public.ai_observation_results(user_id);
CREATE INDEX idx_ai_observation_results_created_at ON public.ai_observation_results(created_at DESC);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_observation_results;