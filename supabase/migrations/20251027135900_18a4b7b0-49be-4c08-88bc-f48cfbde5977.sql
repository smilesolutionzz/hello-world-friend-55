-- Create social media content generation history table
CREATE TABLE public.social_media_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  generated_text TEXT NOT NULL,
  image_url TEXT,
  image_data TEXT,
  hashtags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.social_media_generations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own social media generations"
ON public.social_media_generations
FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Users can create their own social media generations"
ON public.social_media_generations
FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Create indexes
CREATE INDEX idx_social_media_generations_created_by ON public.social_media_generations(created_by);
CREATE INDEX idx_social_media_generations_created_at ON public.social_media_generations(created_at DESC);