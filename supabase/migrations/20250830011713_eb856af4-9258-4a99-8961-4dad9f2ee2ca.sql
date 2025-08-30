-- Fix security warnings from the previous migration

-- Fix Function Search Path for consistency functions
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public';