
-- 1) Remove unrestricted INSERT policy on b2b_followup_queue
DROP POLICY IF EXISTS "Anyone can enqueue followup" ON public.b2b_followup_queue;

-- 2) Restrict sensitive columns on b2b_partner_institutions at the column-privilege level.
-- RLS still controls row visibility; column REVOKEs ensure these fields are never returned
-- to anon/authenticated SELECTs (including via the public directory policy).
REVOKE SELECT (join_code, join_code_expires_at, churn_risk_score, data_accumulated_months, total_observations, email_domain_whitelist)
  ON public.b2b_partner_institutions FROM anon, authenticated;

-- Owners and admins access these fields exclusively through SECURITY DEFINER RPCs
-- (e.g. generate_institution_join_code, redeem_join_code) which run with elevated privileges.
