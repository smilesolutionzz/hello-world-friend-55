-- Fix Security Definer View issues with correct data types
-- Drop ALL problematic views first
DROP VIEW IF EXISTS public.admin_overview_view CASCADE;
DROP VIEW IF EXISTS public.expert_stats_view CASCADE;
DROP VIEW IF EXISTS public.feedback_statistics CASCADE;
DROP VIEW IF EXISTS public.public_institutions CASCADE;

-- Create secure functions with SECURITY INVOKER that respect RLS

-- Admin overview function
CREATE OR REPLACE FUNCTION public.get_admin_overview()
RETURNS TABLE (
  total_users bigint,
  total_tests bigint,
  total_observations bigint,
  total_tokens_in_circulation bigint
)
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT 
    (SELECT count(*)::bigint FROM profiles) AS total_users,
    (SELECT count(*)::bigint FROM test_results) AS total_tests,
    (SELECT count(*)::bigint FROM observation_logs) AS total_observations,
    (SELECT COALESCE(sum(current_tokens), 0)::bigint FROM user_tokens) AS total_tokens_in_circulation;
$$;

-- Expert stats function
CREATE OR REPLACE FUNCTION public.get_expert_stats()
RETURNS TABLE (
  id uuid,
  full_name text,
  specializations text[],
  total_sessions integer,
  average_rating numeric,
  consultation_count bigint
)
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
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
$$;

-- Feedback statistics function
CREATE OR REPLACE FUNCTION public.get_feedback_statistics()
RETURNS TABLE (
  test_type text,
  average_rating numeric,
  total_feedback bigint,
  positive_feedback bigint
)
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT 
    test_type,
    round(avg(rating::numeric), 2) AS average_rating,
    count(*)::bigint AS total_feedback,
    count(CASE WHEN rating >= 4 THEN 1 ELSE NULL END)::bigint AS positive_feedback
  FROM user_feedback
  WHERE is_public = true
  GROUP BY test_type;
$$;

-- Public institutions function with correct data types
CREATE OR REPLACE FUNCTION public.get_public_institutions()
RETURNS TABLE (
  id uuid,
  name text,
  institution_type text,
  address text,
  phone text,
  email text,
  website_url text,
  description text,
  latitude numeric,
  longitude numeric,
  established_year integer,
  total_experts integer,
  rating numeric,
  review_count integer,
  profile_image_url text,
  gallery_images text[],
  operating_hours jsonb,
  services_offered text[],
  specializations text[],
  facilities text[],
  parking_available boolean,
  accessibility_features text[],
  partnership_status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT 
    id, name, institution_type, address, phone, email, website_url,
    description, latitude, longitude, established_year, total_experts,
    rating, review_count, profile_image_url, gallery_images, operating_hours,
    services_offered, specializations, facilities, parking_available,
    accessibility_features, partnership_status, created_at, updated_at
  FROM partner_institutions
  WHERE partnership_status = 'active';
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_admin_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_expert_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_feedback_statistics() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_public_institutions() TO authenticated, anon;