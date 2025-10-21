-- Add full_analysis field to concern_storage table to store complete analysis results
ALTER TABLE public.concern_storage 
ADD COLUMN IF NOT EXISTS full_analysis JSONB DEFAULT '{}'::jsonb;

-- Add index for better query performance on full_analysis
CREATE INDEX IF NOT EXISTS idx_concern_storage_full_analysis ON public.concern_storage USING GIN (full_analysis);

COMMENT ON COLUMN public.concern_storage.full_analysis IS 'Complete AI analysis result including type, severity, advice, recommendations, confidence, and next steps';