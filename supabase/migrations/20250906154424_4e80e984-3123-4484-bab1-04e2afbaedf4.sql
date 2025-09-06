-- Recreate all views as simple, safe views without RLS policies
-- Views cannot have RLS policies, so we'll rely on their definitions for security

-- Drop existing views first
DROP VIEW IF EXISTS public.admin_overview_view CASCADE;
DROP VIEW IF EXISTS public.safe_admin_overview_view CASCADE;
DROP VIEW IF EXISTS public.expert_stats_view CASCADE;
DROP VIEW IF EXISTS public.feedback_statistics CASCADE;
DROP VIEW IF EXISTS public.public_institutions CASCADE;

-- Simple admin overview view (aggregated public data, no sensitive info)
CREATE VIEW public.admin_overview_view AS
SELECT 
  (SELECT count(*)::bigint FROM profiles) AS total_users,
  (SELECT count(*)::bigint FROM test_results) AS total_tests,
  (SELECT count(*)::bigint FROM observation_logs) AS total_observations,
  (SELECT COALESCE(sum(current_tokens), 0)::bigint FROM user_tokens) AS total_tokens_in_circulation;

-- Expert stats view - only public expert information
CREATE VIEW public.expert_stats_view AS
SELECT 
  e.id,
  e.full_name,
  e.specializations,
  e.total_sessions,
  e.average_rating,
  count(c.id)::bigint AS consultation_count
FROM experts e
LEFT JOIN consultations c ON (e.id = c.expert_id)
WHERE e.is_verified = true AND e.is_available = true
GROUP BY e.id, e.full_name, e.specializations, e.total_sessions, e.average_rating;

-- Feedback statistics view - only public feedback
CREATE VIEW public.feedback_statistics AS
SELECT 
  test_type,
  round(avg(rating::numeric), 2) AS average_rating,
  count(*)::bigint AS total_feedback,
  count(CASE WHEN rating >= 4 THEN 1 ELSE NULL END)::bigint AS positive_feedback
FROM user_feedback
WHERE is_public = true
GROUP BY test_type;

-- Public institutions view - only active partnerships
CREATE VIEW public.public_institutions AS
SELECT 
  id, name, institution_type, address, description, website_url,
  profile_image_url, gallery_images, services_offered, specializations,
  facilities, accessibility_features, operating_hours, parking_available,
  rating, review_count, total_experts, established_year, latitude, longitude,
  partnership_status, created_at, updated_at
FROM partner_institutions
WHERE partnership_status = 'active';

-- Grant appropriate access to views (views inherit security from underlying tables)
GRANT SELECT ON public.admin_overview_view TO authenticated;
GRANT SELECT ON public.expert_stats_view TO authenticated, anon;
GRANT SELECT ON public.feedback_statistics TO authenticated, anon;
GRANT SELECT ON public.public_institutions TO authenticated, anon;