-- Drop the existing admin_analytics view
DROP VIEW IF EXISTS public.admin_analytics;

-- Create a secure function that returns admin analytics data
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS TABLE (
  total_users bigint,
  total_subscribers bigint,
  active_subscribers bigint,
  users_with_tests bigint,
  total_tests bigint,
  total_revenue bigint,
  users_with_observations bigint,
  total_observations bigint
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  -- Only allow admin users to access this function
  SELECT 
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) THEN 
        (SELECT count(DISTINCT p.user_id) FROM profiles p)
      ELSE NULL
    END::bigint AS total_users,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) THEN 
        (SELECT count(DISTINCT s.user_id) FROM subscribers s)
      ELSE NULL
    END::bigint AS total_subscribers,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) THEN 
        (SELECT count(DISTINCT s.user_id) FROM subscribers s WHERE s.subscribed = true)
      ELSE NULL
    END::bigint AS active_subscribers,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) THEN 
        (SELECT count(DISTINCT tr.user_id) FROM test_results tr)
      ELSE NULL
    END::bigint AS users_with_tests,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) THEN 
        (SELECT count(tr.id) FROM test_results tr)
      ELSE NULL
    END::bigint AS total_tests,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) THEN 
        (SELECT COALESCE(sum(s.total_paid), 0) FROM subscribers s)
      ELSE NULL
    END::bigint AS total_revenue,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) THEN 
        (SELECT count(DISTINCT ol.user_id) FROM observation_logs ol)
      ELSE NULL
    END::bigint AS users_with_observations,
    CASE 
      WHEN has_role(auth.uid(), 'admin'::app_role) THEN 
        (SELECT count(ol.id) FROM observation_logs ol)
      ELSE NULL
    END::bigint AS total_observations;
$$;

-- Create a new secure view that uses the function
CREATE VIEW public.admin_analytics AS
SELECT * FROM public.get_admin_analytics();

-- Enable RLS on the view (this will work now since it's a simple view)
ALTER VIEW public.admin_analytics SET (security_barrier = true);

-- Grant usage to authenticated users (but data will be filtered by the function)
GRANT SELECT ON public.admin_analytics TO authenticated;