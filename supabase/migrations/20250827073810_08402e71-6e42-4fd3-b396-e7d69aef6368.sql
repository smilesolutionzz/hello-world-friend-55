-- Drop the current view and function
DROP VIEW IF EXISTS public.admin_analytics;
DROP FUNCTION IF EXISTS public.get_admin_analytics();

-- Create a secure admin_analytics table instead of a view
CREATE TABLE IF NOT EXISTS public.admin_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_users bigint DEFAULT 0,
  total_subscribers bigint DEFAULT 0,
  active_subscribers bigint DEFAULT 0,
  users_with_tests bigint DEFAULT 0,
  total_tests bigint DEFAULT 0,
  total_revenue bigint DEFAULT 0,
  users_with_observations bigint DEFAULT 0,
  total_observations bigint DEFAULT 0,
  last_updated timestamp with time zone DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.admin_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admin users to view business analytics
CREATE POLICY "Admins can view business analytics" 
ON public.admin_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy to allow only admin users to insert/update business analytics
CREATE POLICY "Admins can manage business analytics" 
ON public.admin_analytics 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a function to refresh analytics data
CREATE OR REPLACE FUNCTION public.refresh_admin_analytics()
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  -- Clear existing data
  DELETE FROM public.admin_analytics;
  
  -- Insert fresh analytics data
  INSERT INTO public.admin_analytics (
    total_users,
    total_subscribers,
    active_subscribers,
    users_with_tests,
    total_tests,
    total_revenue,
    users_with_observations,
    total_observations,
    last_updated
  )
  SELECT 
    count(DISTINCT p.user_id) AS total_users,
    count(DISTINCT s.user_id) AS total_subscribers,
    count(DISTINCT CASE WHEN s.subscribed = true THEN s.user_id ELSE NULL END) AS active_subscribers,
    count(DISTINCT tr.user_id) AS users_with_tests,
    count(tr.id) AS total_tests,
    COALESCE(sum(s.total_paid), 0) AS total_revenue,
    count(DISTINCT ol.user_id) AS users_with_observations,
    count(ol.id) AS total_observations,
    now() AS last_updated
  FROM profiles p
  LEFT JOIN subscribers s ON p.user_id = s.user_id
  LEFT JOIN test_results tr ON p.user_id = tr.user_id
  LEFT JOIN observation_logs ol ON p.user_id = ol.user_id;
$$;

-- Initialize the analytics data
SELECT public.refresh_admin_analytics();