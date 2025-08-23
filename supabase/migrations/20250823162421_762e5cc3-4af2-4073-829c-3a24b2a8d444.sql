-- Fix security warnings by setting proper search_path for all functions

-- Fix the can_access_family_observation function
CREATE OR REPLACE FUNCTION public.can_access_family_observation(observation_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    observation_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM public.family_members fm 
      WHERE fm.user_id = auth.uid() 
        AND fm.family_id IN (
          SELECT fm2.family_id 
          FROM public.family_members fm2 
          WHERE fm2.user_id = observation_user_id
        )
    );
$$;

-- Fix the log_observation_access function  
CREATE OR REPLACE FUNCTION public.log_observation_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to observation data for security monitoring
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (auth.uid(), 'observation_access', CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + 1;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;