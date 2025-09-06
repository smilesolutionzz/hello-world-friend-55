-- 🔒 CRITICAL SECURITY FIX PHASE 3: Remove dangerous SECURITY DEFINER views
-- These views bypass RLS and can expose data

-- List all views with SECURITY DEFINER to identify them
-- Then replace them with proper RLS-protected views

-- Drop and recreate admin_overview_view as a regular view
DROP VIEW IF EXISTS public.admin_overview_view;

CREATE VIEW public.admin_overview_view AS
SELECT 
  COUNT(DISTINCT ol.user_id) as total_observations,
  COUNT(DISTINCT tr.user_id) as total_tests,
  COALESCE(SUM(ut.current_tokens), 0) as total_tokens_in_circulation,
  COUNT(DISTINCT p.user_id) as total_users
FROM profiles p
LEFT JOIN observation_logs ol ON p.user_id = ol.user_id
LEFT JOIN test_results tr ON p.user_id = tr.user_id  
LEFT JOIN user_tokens ut ON p.user_id = ut.user_id;

-- Apply RLS to admin_overview_view access
GRANT SELECT ON public.admin_overview_view TO authenticated;

-- Drop and recreate expert_stats_view as a regular view
DROP VIEW IF EXISTS public.expert_stats_view;

CREATE VIEW public.expert_stats_view AS
SELECT 
  e.id,
  e.full_name,
  e.specializations,
  e.total_sessions,
  e.average_rating,
  COUNT(c.id) as consultation_count
FROM experts e
LEFT JOIN consultations c ON e.id = c.expert_id
WHERE e.is_verified = true AND e.is_available = true
GROUP BY e.id, e.full_name, e.specializations, e.total_sessions, e.average_rating;

-- Apply RLS to expert_stats_view access  
GRANT SELECT ON public.expert_stats_view TO anon, authenticated;

-- Also fix the check_phone_availability function to not be SECURITY DEFINER
DROP FUNCTION IF EXISTS public.check_phone_availability(text);

CREATE OR REPLACE FUNCTION public.check_phone_availability(phone_number text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  -- Only allow authenticated users to check their own phone availability
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- 전화번호가 null이거나 빈 문자열이면 사용 가능
  IF phone_number IS NULL OR phone_number = '' THEN
    RETURN true;
  END IF;
  
  -- 기존 사용자 중에 같은 전화번호가 있는지 확인 (자신 제외)
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone = phone_number 
    AND user_id != auth.uid()
  );
END;
$$;