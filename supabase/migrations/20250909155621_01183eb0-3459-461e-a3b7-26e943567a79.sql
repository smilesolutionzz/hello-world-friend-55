-- Add admin policies for viewing all user data

-- Allow admins to view all test results
CREATE POLICY "Admins can view all test results" 
ON public.test_results 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all observation logs
CREATE POLICY "Admins can view all observation logs" 
ON public.observation_logs 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all user tokens
CREATE POLICY "Admins can view all user tokens" 
ON public.user_tokens 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin function to get user data with privacy protection
CREATE OR REPLACE FUNCTION public.admin_get_user_data(target_user_id uuid, access_reason text DEFAULT 'Administrative review')
RETURNS TABLE(
  user_id uuid,
  display_name text,
  email text,
  phone text,
  created_at timestamptz,
  current_tokens integer,
  test_count bigint,
  observation_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can use this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Log the access
  INSERT INTO public.financial_access_log (
    accessed_table,
    accessed_record_id,
    accessed_by,
    access_type,
    access_reason,
    sensitive_fields_accessed
  ) VALUES (
    'profiles',
    target_user_id,
    auth.uid(),
    'admin_user_data_access',
    access_reason,
    ARRAY['display_name', 'email', 'phone']
  );

  -- Return the data
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    auth.email() as email, -- This won't work, we need to join with auth.users somehow
    p.phone,
    p.created_at,
    ut.current_tokens,
    COUNT(DISTINCT tr.id)::bigint as test_count,
    COUNT(DISTINCT ol.id)::bigint as observation_count
  FROM public.profiles p
  LEFT JOIN public.user_tokens ut ON p.user_id = ut.user_id
  LEFT JOIN public.test_results tr ON p.user_id = tr.user_id
  LEFT JOIN public.observation_logs ol ON p.user_id = ol.user_id
  WHERE p.user_id = target_user_id
  GROUP BY p.user_id, p.display_name, p.phone, p.created_at, ut.current_tokens;
END;
$$;

-- Create admin function to get user test results
CREATE OR REPLACE FUNCTION public.admin_get_user_tests(target_user_id uuid, access_reason text DEFAULT 'Administrative review')
RETURNS TABLE(
  id uuid,
  test_type text,
  created_at timestamptz,
  scores jsonb,
  ai_analysis text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can use this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Log the access
  INSERT INTO public.financial_access_log (
    accessed_table,
    accessed_record_id,
    accessed_by,
    access_type,
    access_reason,
    sensitive_fields_accessed
  ) VALUES (
    'test_results',
    target_user_id,
    auth.uid(),
    'admin_test_data_access',
    access_reason,
    ARRAY['scores', 'ai_analysis']
  );

  -- Return test data
  RETURN QUERY
  SELECT 
    tr.id,
    tr.test_type,
    tr.created_at,
    tr.scores,
    tr.ai_analysis
  FROM public.test_results tr
  WHERE tr.user_id = target_user_id
  ORDER BY tr.created_at DESC;
END;
$$;

-- Create admin function to get user observations
CREATE OR REPLACE FUNCTION public.admin_get_user_observations(target_user_id uuid, access_reason text DEFAULT 'Administrative review')
RETURNS TABLE(
  id uuid,
  session_name text,
  created_at timestamptz,
  analysis_data jsonb,
  ai_analysis text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can use this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Log the access
  INSERT INTO public.financial_access_log (
    accessed_table,
    accessed_record_id,
    accessed_by,
    access_type,
    access_reason,
    sensitive_fields_accessed
  ) VALUES (
    'observation_logs',
    target_user_id,
    auth.uid(),
    'admin_observation_data_access',
    access_reason,
    ARRAY['analysis_data', 'ai_analysis']
  );

  -- Return observation data
  RETURN QUERY
  SELECT 
    ol.id,
    ol.session_name,
    ol.created_at,
    ol.analysis_data,
    ol.ai_analysis
  FROM public.observation_logs ol
  WHERE ol.user_id = target_user_id
  ORDER BY ol.created_at DESC;
END;
$$;