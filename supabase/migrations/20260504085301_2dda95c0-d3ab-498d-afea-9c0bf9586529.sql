-- Fix 1: Restrict group_sessions SELECT to authenticated users (no anon enumeration of host_user_id)
DROP POLICY IF EXISTS "Anyone can view active sessions" ON public.group_sessions;
CREATE POLICY "Authenticated users can view active sessions"
ON public.group_sessions
FOR SELECT
TO authenticated
USING (is_active = true);

-- Fix 2: Remove cross-tenant SELECT policies on institution premium tables.
-- partner_institutions has no user_id linkage, so restrict reads to admins only.
-- Existing "Admins can manage all ..." (FOR ALL) policies already cover admin SELECT.
DROP POLICY IF EXISTS "Institutions can view their own premium plans" ON public.institution_premium_plans;
DROP POLICY IF EXISTS "Institutions can view their own premium features" ON public.institution_premium_features;
DROP POLICY IF EXISTS "Institutions can view their own analytics" ON public.institution_premium_analytics;