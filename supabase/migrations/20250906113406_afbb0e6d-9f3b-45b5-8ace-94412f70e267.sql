-- 🔒 CRITICAL SECURITY FIX PHASE 4B: Remove dangerous SECURITY DEFINER functions with CASCADE
-- Handle dependencies properly

-- Remove SECURITY DEFINER from observation access logging with CASCADE
DROP FUNCTION IF EXISTS public.log_observation_access() CASCADE;

CREATE OR REPLACE FUNCTION public.log_observation_access()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only log if user is authenticated
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
    VALUES (auth.uid(), 'observation_access', CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature_type, usage_date)
    DO UPDATE SET count = usage_tracking.count + 1;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate the triggers that were dropped
CREATE TRIGGER observation_logs_access_audit
  AFTER SELECT ON public.observation_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.log_observation_access();

CREATE TRIGGER observation_sessions_access_audit
  AFTER SELECT ON public.observation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_observation_access();

-- Remove SECURITY DEFINER from feature usage tracking
DROP FUNCTION IF EXISTS public.track_feature_usage(uuid, text);

CREATE OR REPLACE FUNCTION public.track_feature_usage(p_user_id uuid, p_feature_type text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only allow tracking for authenticated user's own usage
  IF auth.uid() != p_user_id THEN
    RETURN;
  END IF;
  
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (p_user_id, p_feature_type, CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + 1;
END;
$$;

-- Remove SECURITY DEFINER from monthly usage check
DROP FUNCTION IF EXISTS public.get_monthly_usage(uuid, text);

CREATE OR REPLACE FUNCTION public.get_monthly_usage(p_user_id uuid, p_feature_type text)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  -- Only allow checking authenticated user's own usage
  IF auth.uid() != p_user_id THEN
    RETURN 0;
  END IF;
  
  SELECT COALESCE(SUM(count), 0)
  INTO usage_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND usage_date >= DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN usage_count;
END;
$$;