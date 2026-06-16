
-- Fix 1: Restrict centers write operations to admins only (no ownership column exists)
DROP POLICY IF EXISTS centers_auth_insert ON public.centers;
DROP POLICY IF EXISTS centers_auth_update ON public.centers;
DROP POLICY IF EXISTS centers_auth_delete ON public.centers;

CREATE POLICY centers_admin_insert ON public.centers
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY centers_admin_update ON public.centers
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY centers_admin_delete ON public.centers
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Require employee consent before institution can read sensitive session rows
DROP POLICY IF EXISTS "Institution staff view aggregated sessions" ON public.b2b_jobcoach_employee_sessions;

CREATE POLICY "Institution staff view consented sessions"
  ON public.b2b_jobcoach_employee_sessions
  FOR SELECT
  TO authenticated
  USING (
    institution_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.b2b_partner_institutions ins
      WHERE ins.id = b2b_jobcoach_employee_sessions.institution_id
        AND ins.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.employee_data_sharing_preferences p
      WHERE p.institution_id = b2b_jobcoach_employee_sessions.institution_id
        AND p.user_id = b2b_jobcoach_employee_sessions.employee_user_id
        AND p.revoked_at IS NULL
        AND COALESCE(p.share_stress_score, false) = true
        AND COALESCE(p.share_burnout_score, false) = true
    )
  );
