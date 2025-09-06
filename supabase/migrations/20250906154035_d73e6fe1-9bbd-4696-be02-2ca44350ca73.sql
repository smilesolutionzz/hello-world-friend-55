-- Fix Security Definer Views by replacing them with secure alternatives
-- Views using auth.uid() create security definer issues

-- Drop problematic views that use auth.uid()
DROP VIEW IF EXISTS public.token_usage_view;
DROP VIEW IF EXISTS public.user_dashboard_view;

-- Create secure functions instead of views for user-specific data
-- These functions use SECURITY INVOKER (default) which respects the caller's permissions

-- Replace token_usage_view with a secure function
CREATE OR REPLACE FUNCTION public.get_user_token_usage(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  current_tokens integer,
  total_purchased integer,
  referral_bonus integer,
  monthly_usage bigint
)
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT 
    ut.user_id,
    ut.current_tokens,
    ut.total_purchased,
    ut.referral_bonus,
    COALESCE(sum(track.count), 0::bigint) AS monthly_usage
  FROM user_tokens ut
  LEFT JOIN usage_tracking track ON (
    ut.user_id = track.user_id 
    AND track.usage_date >= date_trunc('month', CURRENT_DATE::timestamp with time zone)
  )
  WHERE ut.user_id = COALESCE(p_user_id, auth.uid())
    AND (auth.uid() = ut.user_id OR has_role(auth.uid(), 'admin'::app_role))
  GROUP BY ut.user_id, ut.current_tokens, ut.total_purchased, ut.referral_bonus;
$$;

-- Replace user_dashboard_view with a secure function
CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  current_tokens integer,
  observation_count bigint,
  test_count bigint
)
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    ut.current_tokens,
    count(DISTINCT ol.id) AS observation_count,
    count(DISTINCT tr.id) AS test_count
  FROM profiles p
  LEFT JOIN user_tokens ut ON (p.user_id = ut.user_id)
  LEFT JOIN observation_logs ol ON (p.user_id = ol.user_id)
  LEFT JOIN test_results tr ON (p.user_id = tr.user_id)
  WHERE p.user_id = COALESCE(p_user_id, auth.uid())
    AND (auth.uid() = p.user_id OR has_role(auth.uid(), 'admin'::app_role))
  GROUP BY p.user_id, p.display_name, ut.current_tokens;
$$;

-- Create a safe aggregated view for admin analytics that doesn't use auth.uid()
CREATE OR REPLACE VIEW public.safe_admin_overview_view AS
SELECT 
  (SELECT count(*) FROM profiles) AS total_users,
  (SELECT count(*) FROM test_results) AS total_tests,
  (SELECT count(*) FROM observation_logs) AS total_observations,
  (SELECT COALESCE(sum(current_tokens), 0::bigint) FROM user_tokens) AS total_tokens_in_circulation;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.get_user_token_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_dashboard_data(uuid) TO authenticated;
GRANT SELECT ON public.safe_admin_overview_view TO authenticated;

-- Create RLS policy for the functions (they handle their own security)
-- The functions already check auth.uid() internally and verify permissions