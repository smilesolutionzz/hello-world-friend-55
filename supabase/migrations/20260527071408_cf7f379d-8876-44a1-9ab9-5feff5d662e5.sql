
-- 1. b2b_followup_queue — add admin-only INSERT (SELECT/UPDATE/DELETE already admin-only)
CREATE POLICY "Admins can insert followup queue"
ON public.b2b_followup_queue
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. daily_coaching_email_tokens — add admin-only INSERT/UPDATE/DELETE
CREATE POLICY "Admins can insert tokens"
ON public.daily_coaching_email_tokens
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tokens"
ON public.daily_coaching_email_tokens
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tokens"
ON public.daily_coaching_email_tokens
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. email_send_log — add admin-only INSERT/UPDATE/DELETE
CREATE POLICY "Admins can insert email send log"
ON public.email_send_log
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update email send log"
ON public.email_send_log
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete email send log"
ON public.email_send_log
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. email_unsubscribe_tokens — add admin-only INSERT/UPDATE/DELETE
CREATE POLICY "Admins can insert unsubscribe tokens"
ON public.email_unsubscribe_tokens
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update unsubscribe tokens"
ON public.email_unsubscribe_tokens
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete unsubscribe tokens"
ON public.email_unsubscribe_tokens
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. suppressed_emails — add admin-only INSERT/UPDATE/DELETE
CREATE POLICY "Admins can insert suppressed emails"
ON public.suppressed_emails
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update suppressed emails"
ON public.suppressed_emails
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete suppressed emails"
ON public.suppressed_emails
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Realtime publication cleanup — remove tables that don't need broadcast
ALTER PUBLICATION supabase_realtime DROP TABLE public.mind_track_enrollments;
ALTER PUBLICATION supabase_realtime DROP TABLE public.mind_track_workbooks;
ALTER PUBLICATION supabase_realtime DROP TABLE public.mind_track_daily_missions;
ALTER PUBLICATION supabase_realtime DROP TABLE public.mind_track_checkins;
ALTER PUBLICATION supabase_realtime DROP TABLE public.ai_observation_results;
ALTER PUBLICATION supabase_realtime DROP TABLE public.user_feedback;
