-- Create emotion diary table for daily voice emotion tracking
CREATE TABLE IF NOT EXISTS public.emotion_diaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  audio_url TEXT,
  transcription TEXT NOT NULL,
  detected_emotions JSONB NOT NULL DEFAULT '{}',
  primary_emotion TEXT,
  emotion_score NUMERIC(3,2),
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emotion_diaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own emotion diaries"
  ON public.emotion_diaries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emotion diaries"
  ON public.emotion_diaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emotion diaries"
  ON public.emotion_diaries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emotion diaries"
  ON public.emotion_diaries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function for automatic timestamp update
CREATE OR REPLACE FUNCTION public.update_emotion_diary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_emotion_diaries_updated_at
  BEFORE UPDATE ON public.emotion_diaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_emotion_diary_updated_at();

-- Create index for faster queries
CREATE INDEX idx_emotion_diaries_user_id ON public.emotion_diaries(user_id);
CREATE INDEX idx_emotion_diaries_recorded_at ON public.emotion_diaries(recorded_at DESC);
CREATE INDEX idx_emotion_diaries_primary_emotion ON public.emotion_diaries(primary_emotion);
