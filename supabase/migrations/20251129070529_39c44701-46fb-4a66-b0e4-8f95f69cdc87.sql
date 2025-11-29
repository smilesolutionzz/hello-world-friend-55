-- Add media support to observations table
ALTER TABLE public.observations 
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;

-- Create observation shares table for family sharing
CREATE TABLE IF NOT EXISTS public.observation_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID,
  share_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(observation_id, shared_with_email)
);

-- Enable RLS on observation_shares
ALTER TABLE public.observation_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view shares they created or received
CREATE POLICY "Users can view their shares"
ON public.observation_shares FOR SELECT
USING (
  auth.uid() = shared_by OR 
  auth.uid() = shared_with_user_id OR
  auth.email() = shared_with_email
);

-- Policy: Users can create shares for their own observations
CREATE POLICY "Users can create shares"
ON public.observation_shares FOR INSERT
WITH CHECK (
  auth.uid() = shared_by AND
  EXISTS (
    SELECT 1 FROM public.observations 
    WHERE id = observation_id AND user_id = auth.uid()
  )
);

-- Policy: Users can delete shares they created
CREATE POLICY "Users can delete their shares"
ON public.observation_shares FOR DELETE
USING (auth.uid() = shared_by);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_observations_user_created 
ON public.observations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_observation_shares_observation 
ON public.observation_shares(observation_id);

-- Add comment for documentation
COMMENT ON TABLE public.observation_shares IS 'Stores observation sharing records for family members';
COMMENT ON COLUMN public.observations.media_urls IS 'Array of media file URLs (images/videos) attached to observation';