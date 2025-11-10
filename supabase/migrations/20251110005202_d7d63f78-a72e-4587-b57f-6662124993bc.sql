-- Create personality_analysis table
CREATE TABLE IF NOT EXISTS public.personality_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_text TEXT NOT NULL,
  data_sources JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personality_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own personality analysis"
ON public.personality_analysis
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personality analysis"
ON public.personality_analysis
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personality analysis"
ON public.personality_analysis
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personality analysis"
ON public.personality_analysis
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_personality_analysis_user_id ON public.personality_analysis(user_id);
CREATE INDEX idx_personality_analysis_created_at ON public.personality_analysis(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_personality_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personality_analysis_updated_at
BEFORE UPDATE ON public.personality_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_personality_analysis_updated_at();
