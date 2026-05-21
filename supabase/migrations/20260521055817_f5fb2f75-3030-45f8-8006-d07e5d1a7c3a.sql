
-- 1) b2b_ad_analytics: require ownership of the institution being written about
DROP POLICY IF EXISTS "Authenticated users can insert ad analytics" ON public.b2b_ad_analytics;
CREATE POLICY "Institution owners can insert ad analytics"
  ON public.b2b_ad_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.b2b_partner_institutions pi
      WHERE pi.id = b2b_ad_analytics.institution_id
        AND pi.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- 2) financial_data_access_log: only service role / SECURITY DEFINER funcs may write
DROP POLICY IF EXISTS "System can create financial access logs" ON public.financial_data_access_log;
DROP POLICY IF EXISTS "System can log access" ON public.financial_data_access_log;

-- 3) life_achievement_leaderboard: no direct user writes
DROP POLICY IF EXISTS "Users can update their own leaderboard" ON public.life_achievement_leaderboard;
DROP POLICY IF EXISTS "Users can update leaderboard" ON public.life_achievement_leaderboard;

-- 4) reward_transactions: no direct user writes
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.reward_transactions;

-- 5) token_transactions: no direct user writes
DROP POLICY IF EXISTS "Users can create their own token transactions" ON public.token_transactions;

-- 6) user_growth_points: convert ALL policy to read-only
DROP POLICY IF EXISTS "Users can manage their own growth points" ON public.user_growth_points;
-- (existing "Users can view own growth points" SELECT policy remains)

-- 7) user_report_credits: drop user UPDATE
DROP POLICY IF EXISTS "Users can update own credits" ON public.user_report_credits;
