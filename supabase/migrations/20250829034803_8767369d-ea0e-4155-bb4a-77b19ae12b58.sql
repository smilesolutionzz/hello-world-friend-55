-- Fix search path for functions to address security warnings
ALTER FUNCTION public.update_timeline_activities_updated_at() SET search_path = 'public';

-- Also update the assessments update function if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
  END IF;
END $$;