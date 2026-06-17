
-- b2b_inquiries uses "email"/"phone"
DROP POLICY IF EXISTS "Anyone can create B2B inquiries" ON public.b2b_inquiries;
CREATE POLICY "Anyone can create B2B inquiries" ON public.b2b_inquiries
  FOR INSERT TO public
  WITH CHECK (
    email IS NOT NULL AND length(btrim(email)) BETWEEN 5 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

DROP POLICY IF EXISTS "Anyone can submit ad inquiries" ON public.b2b_ad_inquiries;
CREATE POLICY "Anyone can submit ad inquiries" ON public.b2b_ad_inquiries
  FOR INSERT TO public
  WITH CHECK (
    contact_email IS NOT NULL AND length(btrim(contact_email)) BETWEEN 5 AND 320
    AND contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

DROP POLICY IF EXISTS "Anyone can submit jobcoach inquiry" ON public.b2b_jobcoach_inquiries;
CREATE POLICY "Anyone can submit jobcoach inquiry" ON public.b2b_jobcoach_inquiries
  FOR INSERT TO public
  WITH CHECK (
    contact_email IS NOT NULL AND length(btrim(contact_email)) BETWEEN 5 AND 320
    AND contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

DROP POLICY IF EXISTS "Anyone can submit b2b demo request" ON public.b2b_demo_requests;
CREATE POLICY "Anyone can submit b2b demo request" ON public.b2b_demo_requests
  FOR INSERT TO public
  WITH CHECK (
    contact_email IS NOT NULL AND length(btrim(contact_email)) BETWEEN 5 AND 320
    AND contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- b2b_lead_downloads uses "email"
DROP POLICY IF EXISTS "anyone can submit lead" ON public.b2b_lead_downloads;
CREATE POLICY "anyone can submit lead" ON public.b2b_lead_downloads
  FOR INSERT TO public
  WITH CHECK (
    email IS NOT NULL AND length(btrim(email)) BETWEEN 5 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

DROP POLICY IF EXISTS "Anyone can insert subscription_requests" ON public.subscription_requests;
CREATE POLICY "Anyone can insert subscription_requests" ON public.subscription_requests
  FOR INSERT TO public
  WITH CHECK (
    contact_email IS NOT NULL AND length(btrim(contact_email)) BETWEEN 5 AND 320
    AND contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND contact_name IS NOT NULL AND length(btrim(contact_name)) > 0
    AND contact_phone IS NOT NULL AND length(btrim(contact_phone)) > 0
  );

-- expert_applications: add owner SELECT policy
DROP POLICY IF EXISTS "Applicants can view own application" ON public.expert_applications;
CREATE POLICY "Applicants can view own application" ON public.expert_applications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all applications" ON public.expert_applications;
CREATE POLICY "Admins can view all applications" ON public.expert_applications
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- financial_access_log: remove open insert; service_role bypasses RLS
DROP POLICY IF EXISTS "System can create financial access logs" ON public.financial_access_log;

-- user_experiment_assignments: only self-assignment
DROP POLICY IF EXISTS "System can assign users to experiments" ON public.user_experiment_assignments;
CREATE POLICY "Users can assign themselves to experiments" ON public.user_experiment_assignments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
