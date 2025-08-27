-- Fix security definer view issue
DROP VIEW IF EXISTS public.admin_analytics;

-- Create a simple view without security definer
CREATE VIEW public.admin_analytics AS
SELECT 
    COUNT(DISTINCT p.user_id) as total_users,
    COUNT(DISTINCT s.user_id) as total_subscribers,
    COUNT(DISTINCT CASE WHEN s.subscribed = true THEN s.user_id END) as active_subscribers,
    COUNT(DISTINCT tr.user_id) as users_with_tests,
    COUNT(tr.id) as total_tests,
    COALESCE(SUM(s.total_paid), 0) as total_revenue,
    COUNT(DISTINCT ol.user_id) as users_with_observations,
    COUNT(ol.id) as total_observations
FROM profiles p
LEFT JOIN subscribers s ON p.user_id = s.user_id
LEFT JOIN test_results tr ON p.user_id = tr.user_id
LEFT JOIN observation_logs ol ON p.user_id = ol.user_id;