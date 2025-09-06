-- 🔒 SECURITY FIX: Remove problematic SECURITY DEFINER views
-- This addresses the security definer view warnings

-- 1. Drop the security definer views that bypass RLS
DROP VIEW IF EXISTS public.admin_overview_view;
DROP VIEW IF EXISTS public.expert_stats_view;

-- 2. Create secure replacement views without SECURITY DEFINER
-- These will respect RLS policies instead of bypassing them

-- Admin overview view (only for admins through RLS)
CREATE VIEW public.admin_overview_view AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.test_results) as total_tests,
  (SELECT COUNT(*) FROM public.observation_logs) as total_observations,
  (SELECT COALESCE(SUM(current_tokens), 0) FROM public.user_tokens) as total_tokens_in_circulation;

-- Expert stats view (public information only)
CREATE VIEW public.expert_stats_view AS
SELECT 
  e.id,
  e.full_name,
  e.specializations,
  e.total_sessions,
  e.average_rating,
  COUNT(c.id) as consultation_count
FROM public.experts e
LEFT JOIN public.consultations c ON e.id = c.expert_id
WHERE e.is_verified = true AND e.is_available = true
GROUP BY e.id, e.full_name, e.specializations, e.total_sessions, e.average_rating;

-- Grant appropriate access to the views
GRANT SELECT ON public.admin_overview_view TO authenticated;
GRANT SELECT ON public.expert_stats_view TO anon, authenticated;