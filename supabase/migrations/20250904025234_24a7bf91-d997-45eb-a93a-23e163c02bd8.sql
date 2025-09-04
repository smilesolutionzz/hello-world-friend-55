-- Security review: Fix any remaining Security Definer views
-- First, let's check and recreate views without SECURITY DEFINER

-- Drop and recreate admin_overview_view to ensure it doesn't have SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_overview_view CASCADE;

CREATE VIEW public.admin_overview_view AS
SELECT 
    COUNT(DISTINCT p.user_id) as total_users,
    COUNT(DISTINCT ol.id) as total_observations,
    COUNT(DISTINCT tr.id) as total_tests,
    SUM(ut.current_tokens) as total_tokens_in_circulation
FROM profiles p
LEFT JOIN observation_logs ol ON p.user_id = ol.user_id
LEFT JOIN test_results tr ON p.user_id = tr.user_id
LEFT JOIN user_tokens ut ON p.user_id = ut.user_id;

-- Enable RLS on the view
ALTER TABLE public.admin_overview_view ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin access only
CREATE POLICY "Admin only access to overview" ON public.admin_overview_view
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop and recreate expert_stats_view to ensure it doesn't have SECURITY DEFINER  
DROP VIEW IF EXISTS public.expert_stats_view CASCADE;

CREATE VIEW public.expert_stats_view AS
SELECT 
    e.id,
    e.full_name,
    e.specializations,
    e.total_sessions,
    e.average_rating,
    COUNT(DISTINCT c.id) as consultation_count
FROM experts e
LEFT JOIN consultations c ON e.id = c.expert_id
WHERE e.user_id = auth.uid()
GROUP BY e.id, e.full_name, e.specializations, e.total_sessions, e.average_rating;

-- Enable RLS on the view
ALTER TABLE public.expert_stats_view ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for expert access to their own stats
CREATE POLICY "Experts can view their own stats" ON public.expert_stats_view
    FOR SELECT USING (true); -- Already filtered in the view by auth.uid()

-- Drop and recreate token_usage_view to ensure it doesn't have SECURITY DEFINER
DROP VIEW IF EXISTS public.token_usage_view CASCADE;

CREATE VIEW public.token_usage_view AS
SELECT 
    ut.user_id,
    ut.current_tokens,
    ut.total_purchased,
    ut.total_spent,
    ut.referral_bonus,
    ut.last_daily_bonus_date,
    COALESCE(SUM(usage.count), 0) as monthly_usage
FROM user_tokens ut
LEFT JOIN usage_tracking usage ON ut.user_id = usage.user_id 
    AND usage.usage_date >= DATE_TRUNC('month', CURRENT_DATE)
WHERE ut.user_id = auth.uid()
GROUP BY ut.user_id, ut.current_tokens, ut.total_purchased, ut.total_spent, ut.referral_bonus, ut.last_daily_bonus_date;

-- Enable RLS on the view
ALTER TABLE public.token_usage_view ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user access to their own token usage
CREATE POLICY "Users can view their own token usage" ON public.token_usage_view
    FOR SELECT USING (true); -- Already filtered in the view by auth.uid()

-- Drop and recreate user_dashboard_view to ensure it doesn't have SECURITY DEFINER
DROP VIEW IF EXISTS public.user_dashboard_view CASCADE;

CREATE VIEW public.user_dashboard_view AS
SELECT 
    p.user_id,
    p.display_name,
    ut.current_tokens,
    COUNT(DISTINCT tr.id) as test_count,
    COUNT(DISTINCT ol.id) as observation_count,
    COUNT(DISTINCT c.id) as consultation_count
FROM profiles p
LEFT JOIN user_tokens ut ON p.user_id = ut.user_id
LEFT JOIN test_results tr ON p.user_id = tr.user_id
LEFT JOIN observation_logs ol ON p.user_id = ol.user_id
LEFT JOIN consultations c ON p.user_id = c.user_id
WHERE p.user_id = auth.uid()
GROUP BY p.user_id, p.display_name, ut.current_tokens;

-- Enable RLS on the view
ALTER TABLE public.user_dashboard_view ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user access to their own dashboard
CREATE POLICY "Users can view their own dashboard" ON public.user_dashboard_view
    FOR SELECT USING (true); -- Already filtered in the view by auth.uid()