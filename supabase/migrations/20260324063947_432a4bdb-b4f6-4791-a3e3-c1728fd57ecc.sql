
-- ============================================
-- 🔒 CRITICAL: user_subscriptions 권한 상승 취약점 수정
-- ============================================
DROP POLICY IF EXISTS "구독 생성" ON public.user_subscriptions;
DROP POLICY IF EXISTS "구독 업데이트" ON public.user_subscriptions;

CREATE POLICY "users_insert_own_subscriptions"
ON public.user_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_subscriptions"
ON public.user_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 🔒 CRITICAL: realtime_consultation_messages 공개 접근 차단
-- ============================================
DROP POLICY IF EXISTS "Anyone can view messages" ON public.realtime_consultation_messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON public.realtime_consultation_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.realtime_consultation_messages;

CREATE POLICY "users_view_own_messages"
ON public.realtime_consultation_messages FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR session_id IN (
  SELECT id FROM public.realtime_consultation_sessions WHERE user_id = auth.uid() OR expert_id = auth.uid()
));

CREATE POLICY "users_send_own_messages"
ON public.realtime_consultation_messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "users_update_own_messages"
ON public.realtime_consultation_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid() OR session_id IN (
  SELECT id FROM public.realtime_consultation_sessions WHERE user_id = auth.uid() OR expert_id = auth.uid()
));

-- ============================================
-- 🔒 CRITICAL: realtime_consultation_sessions 공개 접근 차단
-- ============================================
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.realtime_consultation_sessions;
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.realtime_consultation_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.realtime_consultation_sessions;

CREATE POLICY "users_view_own_sessions"
ON public.realtime_consultation_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR expert_id = auth.uid());

CREATE POLICY "users_create_own_sessions"
ON public.realtime_consultation_sessions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_sessions"
ON public.realtime_consultation_sessions FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR expert_id = auth.uid());

-- ============================================
-- 🔒 CRITICAL: consultation_bookings 공개 읽기 차단
-- ============================================
DROP POLICY IF EXISTS "Allow public read consultation_bookings" ON public.consultation_bookings;

-- ============================================
-- 🔒 CRITICAL: payments 테이블 공개 읽기 차단
-- ============================================
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

CREATE POLICY "service_role_only_payments"
ON public.payments FOR SELECT
TO service_role
USING (true);

-- ============================================
-- 🔒 user_free_trials - service_role로 제한
-- ============================================
DROP POLICY IF EXISTS "Service role can manage free trials" ON public.user_free_trials;

CREATE POLICY "users_view_own_trials"
ON public.user_free_trials FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "service_role_manage_trials"
ON public.user_free_trials FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 🔒 admin_notifications - 관리자만 접근
-- ============================================
DROP POLICY IF EXISTS "관리자 알림 조회" ON public.admin_notifications;
DROP POLICY IF EXISTS "관리자 알림 읽음 처리" ON public.admin_notifications;
DROP POLICY IF EXISTS "Authenticated users can view notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Authenticated users can update notifications" ON public.admin_notifications;

CREATE POLICY "admins_view_notifications"
ON public.admin_notifications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_update_notifications"
ON public.admin_notifications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 🔒 facility_audit_item_status - public 정책 제거
-- ============================================
DROP POLICY IF EXISTS "facility_audit_item_status_all" ON public.facility_audit_item_status;

-- ============================================
-- 🔒 facility_audit_checks - public 정책 제거
-- ============================================
DROP POLICY IF EXISTS "Facility staff can insert audit checks" ON public.facility_audit_checks;
DROP POLICY IF EXISTS "Facility staff can update audit checks" ON public.facility_audit_checks;
DROP POLICY IF EXISTS "Facility staff can view their audit checks" ON public.facility_audit_checks;

CREATE POLICY "authenticated_staff_view_audit_checks"
ON public.facility_audit_checks FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.facility_staff fs
  WHERE fs.facility_id = facility_audit_checks.facility_id
  AND fs.user_id = auth.uid()
  AND fs.is_active = true
));

CREATE POLICY "authenticated_staff_insert_audit_checks"
ON public.facility_audit_checks FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.facility_staff fs
  WHERE fs.facility_id = facility_audit_checks.facility_id
  AND fs.user_id = auth.uid()
  AND fs.is_active = true
));

CREATE POLICY "authenticated_staff_update_audit_checks"
ON public.facility_audit_checks FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.facility_staff fs
  WHERE fs.facility_id = facility_audit_checks.facility_id
  AND fs.user_id = auth.uid()
  AND fs.is_active = true
));

-- ============================================
-- 🔒 staff_training_records - public 정책 제거
-- ============================================
DROP POLICY IF EXISTS "Facility staff can view training records" ON public.staff_training_records;
DROP POLICY IF EXISTS "Facility staff can insert training records" ON public.staff_training_records;
DROP POLICY IF EXISTS "Facility staff can update training records" ON public.staff_training_records;

CREATE POLICY "authenticated_staff_view_training"
ON public.staff_training_records FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.facility_staff fs
  WHERE fs.facility_id = staff_training_records.facility_id
  AND fs.user_id = auth.uid()
  AND fs.is_active = true
));

CREATE POLICY "authenticated_staff_insert_training"
ON public.staff_training_records FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.facility_staff fs
  WHERE fs.facility_id = staff_training_records.facility_id
  AND fs.user_id = auth.uid()
  AND fs.is_active = true
));

CREATE POLICY "authenticated_staff_update_training"
ON public.staff_training_records FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.facility_staff fs
  WHERE fs.facility_id = staff_training_records.facility_id
  AND fs.user_id = auth.uid()
  AND fs.is_active = true
));
