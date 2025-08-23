-- Fix the function search path security issue for the family access function
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