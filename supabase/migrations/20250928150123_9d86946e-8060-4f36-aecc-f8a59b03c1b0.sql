-- Create voice_diary_entries table for saving analyzed voice diaries
CREATE TABLE IF NOT EXISTS public.voice_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  audio_url TEXT,
  audio_duration INTEGER,
  transcription TEXT,
  emotion_analysis JSONB,
  diary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.voice_diary_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_diary_entries
CREATE POLICY "Users can view their own voice diaries"
ON public.voice_diary_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice diaries"
ON public.voice_diary_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice diaries"
ON public.voice_diary_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice diaries"
ON public.voice_diary_entries FOR DELETE
USING (auth.uid() = user_id);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_voice_diary_entries_updated_at ON public.voice_diary_entries;
CREATE TRIGGER update_voice_diary_entries_updated_at
BEFORE UPDATE ON public.voice_diary_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create public Storage bucket for voice recordings (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-recordings', 'voice-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for voice recordings
-- Public read access (since we share public URLs)
CREATE POLICY "Voice recordings are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-recordings');

-- Allow authenticated users to upload/update/delete only within their own folder
CREATE POLICY "Users can upload their own voice recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'voice-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own voice recordings"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'voice-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'voice-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own voice recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'voice-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
