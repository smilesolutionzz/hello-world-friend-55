-- Create storage bucket for observation media
INSERT INTO storage.buckets (id, name, public) VALUES ('observation-media', 'observation-media', false);

-- Create policies for observation media storage
CREATE POLICY "Users can upload their own observation media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'observation-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own observation media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'observation-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own observation media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'observation-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add media_files column to observation_sessions
ALTER TABLE observation_sessions ADD COLUMN media_files jsonb DEFAULT '[]'::jsonb;

-- Add subscription tracking
CREATE TABLE user_subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count integer DEFAULT 0,
  subscription_status text DEFAULT 'free',
  trial_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for user subscription usage
CREATE POLICY "Users can manage their own subscription usage" 
ON user_subscription_usage 
FOR ALL 
USING (user_id = auth.uid());

-- Add usage tracking trigger
CREATE OR REPLACE FUNCTION increment_usage_count()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_subscription_usage (user_id, usage_count)
  VALUES (NEW.profile_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    usage_count = user_subscription_usage.usage_count + 1,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- This trigger will be created but we need to get user_id from profile_id
-- Let's modify the trigger to work with our structure
DROP TRIGGER IF EXISTS track_observation_usage ON observation_sessions;

-- Add better evaluation scales to templates
UPDATE observation_templates 
SET items = jsonb_set(
  items,
  '{0}',
  jsonb_set(
    items->0,
    '{scale_labels}',
    '["전혀 관찰되지 않음", "가끔 관찰됨", "보통 수준", "자주 관찰됨", "항상 관찰됨"]'::jsonb
  )
)
WHERE domain = 'child_development';

UPDATE observation_templates 
SET items = jsonb_set(
  items,
  '{0}',
  jsonb_set(
    items->0,
    '{scale_labels}',
    '["전혀 나타나지 않음", "경미하게 나타남", "보통 수준", "자주 나타남", "매우 심각함"]'::jsonb
  )
)
WHERE domain = 'psychology';