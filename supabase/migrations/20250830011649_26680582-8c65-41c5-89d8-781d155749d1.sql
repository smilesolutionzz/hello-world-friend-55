-- Fix observation analysis data matching and PDF content accuracy

-- Update observation_logs table to ensure consistent data structure
ALTER TABLE public.observation_logs 
ADD COLUMN IF NOT EXISTS session_name TEXT;

-- Create function to ensure data consistency for observation analysis
CREATE OR REPLACE FUNCTION public.ensure_observation_data_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure session_name is consistent
  IF NEW.session_name IS NULL AND NEW.analysis_data IS NOT NULL THEN
    NEW.session_name := COALESCE(
      NEW.analysis_data->>'session_name',
      '관찰일지_' || TO_CHAR(NEW.created_at, 'YYYY-MM-DD')
    );
  END IF;
  
  -- Ensure analysis_data has proper structure
  IF NEW.analysis_data IS NOT NULL THEN
    NEW.analysis_data := jsonb_set(
      NEW.analysis_data,
      '{timestamp}',
      to_jsonb(EXTRACT(EPOCH FROM NEW.created_at))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data consistency
DROP TRIGGER IF EXISTS ensure_observation_consistency ON public.observation_logs;
CREATE TRIGGER ensure_observation_consistency
  BEFORE INSERT OR UPDATE ON public.observation_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_observation_data_consistency();