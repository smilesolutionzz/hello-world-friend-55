-- Create observations table for AI-enhanced observation journals
CREATE TABLE public.observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  observation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- AI Analysis Fields
  behaviors TEXT[] DEFAULT '{}',
  emotions TEXT[] DEFAULT '{}',
  concerns TEXT[] DEFAULT '{}',
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'urgent')),
  ai_suggestions TEXT[] DEFAULT '{}',
  recommended_tests JSONB DEFAULT '[]',
  
  -- Metadata
  is_voice_generated BOOLEAN DEFAULT FALSE,
  voice_transcription TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own observations"
ON public.observations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own observations"
ON public.observations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own observations"
ON public.observations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observations"
ON public.observations
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_observations_user_id ON public.observations(user_id);
CREATE INDEX idx_observations_date ON public.observations(observation_date DESC);
CREATE INDEX idx_observations_severity ON public.observations(severity);

-- Trigger for updated_at
CREATE TRIGGER update_observations_updated_at
BEFORE UPDATE ON public.observations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();