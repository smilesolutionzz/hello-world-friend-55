-- Security Definer View 문제를 우회하기 위한 안전한 뷰 대안 생성
-- 시스템 뷰를 대체할 수 있는 보안 강화된 뷰들 생성

-- 사용자 대시보드용 안전한 뷰 생성 (SECURITY INVOKER 명시적 설정)
CREATE OR REPLACE VIEW public.user_dashboard_view
WITH (security_invoker = true)
AS
SELECT 
  p.user_id,
  p.display_name,
  ut.current_tokens,
  COUNT(DISTINCT ol.id) as observation_count,
  COUNT(DISTINCT tr.id) as test_count
FROM public.profiles p
LEFT JOIN public.user_tokens ut ON p.user_id = ut.user_id
LEFT JOIN public.observation_logs ol ON p.user_id = ol.user_id
LEFT JOIN public.test_results tr ON p.user_id = tr.user_id
WHERE p.user_id = auth.uid()
GROUP BY p.user_id, p.display_name, ut.current_tokens;

-- 전문가 통계용 안전한 뷰 생성
CREATE OR REPLACE VIEW public.expert_stats_view
WITH (security_invoker = true)
AS
SELECT 
  e.id,
  e.full_name,
  e.specializations,
  e.total_sessions,
  e.average_rating,
  COUNT(DISTINCT c.id) as consultation_count
FROM public.experts e
LEFT JOIN public.consultations c ON e.id = c.expert_id
WHERE e.user_id = auth.uid()
GROUP BY e.id, e.full_name, e.specializations, e.total_sessions, e.average_rating;

-- 관리자 분석용 안전한 뷰 생성 (admin 권한 확인)
CREATE OR REPLACE VIEW public.admin_overview_view
WITH (security_invoker = true)
AS
SELECT 
  COUNT(DISTINCT p.user_id) as total_users,
  COUNT(DISTINCT ol.id) as total_observations,
  COUNT(DISTINCT tr.id) as total_tests,
  SUM(ut.current_tokens) as total_tokens_in_circulation
FROM public.profiles p
LEFT JOIN public.observation_logs ol ON p.user_id = ol.user_id
LEFT JOIN public.test_results tr ON p.user_id = tr.user_id
LEFT JOIN public.user_tokens ut ON p.user_id = ut.user_id
WHERE public.has_role(auth.uid(), 'admin');

-- 토큰 사용량 분석용 뷰
CREATE OR REPLACE VIEW public.token_usage_view
WITH (security_invoker = true)
AS
SELECT 
  ut.user_id,
  ut.current_tokens,
  ut.total_purchased,
  ut.referral_bonus,
  COALESCE(SUM(track.count), 0) as monthly_usage
FROM public.user_tokens ut
LEFT JOIN public.usage_tracking track ON ut.user_id = track.user_id 
  AND track.usage_date >= DATE_TRUNC('month', CURRENT_DATE)
WHERE ut.user_id = auth.uid()
GROUP BY ut.user_id, ut.current_tokens, ut.total_purchased, ut.referral_bonus;