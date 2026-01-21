-- 위기 감지 알림 테이블
CREATE TABLE IF NOT EXISTS public.crisis_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'mood_crisis', -- mood_crisis, diary_keyword, assessment_risk
  severity_level TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  trigger_source TEXT, -- mind_diary, assessment, observation
  trigger_data JSONB,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  expert_connected BOOLEAN DEFAULT false,
  expert_id UUID REFERENCES public.experts(id),
  guardian_notified BOOLEAN DEFAULT false,
  institution_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.crisis_alerts ENABLE ROW LEVEL SECURITY;

-- 본인 알림 조회
CREATE POLICY "Users can view own crisis alerts"
ON public.crisis_alerts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 전문가가 연결된 알림 조회
CREATE POLICY "Experts can view assigned alerts"
ON public.crisis_alerts FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM experts WHERE id = expert_id));

-- 관리자 전체 조회
CREATE POLICY "Admins can view all alerts"
ON public.crisis_alerts FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 시스템이 알림 생성 (authenticated users)
CREATE POLICY "Users can create own crisis alerts"
ON public.crisis_alerts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 긴급 연결 요청 테이블
CREATE TABLE IF NOT EXISTS public.urgent_expert_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  crisis_alert_id UUID REFERENCES public.crisis_alerts(id),
  request_type TEXT NOT NULL DEFAULT 'standard', -- standard, urgent, emergency
  specialization_needed TEXT[], -- 필요한 전문 분야
  preferred_method TEXT DEFAULT 'video', -- video, phone, chat
  urgency_fee INTEGER DEFAULT 0, -- 긴급 연결 추가 요금
  matched_expert_id UUID REFERENCES public.experts(id),
  matched_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- pending, matched, in_progress, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.urgent_expert_requests ENABLE ROW LEVEL SECURITY;

-- 본인 요청 조회/생성
CREATE POLICY "Users can manage own urgent requests"
ON public.urgent_expert_requests FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 전문가가 매칭된 요청 조회
CREATE POLICY "Experts can view matched requests"
ON public.urgent_expert_requests FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM experts WHERE id = matched_expert_id));

-- 관리자 전체 접근
CREATE POLICY "Admins can manage all urgent requests"
ON public.urgent_expert_requests FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 상담 수수료 타입 추가 (consultation_bookings 확장)
ALTER TABLE public.consultation_bookings 
ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'standard', -- standard, urgent, deep
ADD COLUMN IF NOT EXISTS commission_type TEXT DEFAULT 'standard', -- standard (20%), urgent (+5000), deep (15%)
ADD COLUMN IF NOT EXISTS platform_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS expert_earning INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crisis_alert_id UUID REFERENCES public.crisis_alerts(id);

-- 수수료 계산 함수
CREATE OR REPLACE FUNCTION public.calculate_consultation_fees(
  p_amount INTEGER,
  p_booking_type TEXT DEFAULT 'standard'
)
RETURNS TABLE(platform_fee INTEGER, expert_earning INTEGER, commission_rate NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission_rate NUMERIC;
  v_platform_fee INTEGER;
  v_expert_earning INTEGER;
  v_urgency_fee INTEGER := 0;
BEGIN
  -- 타입별 수수료율 결정
  CASE p_booking_type
    WHEN 'urgent' THEN 
      v_commission_rate := 20.00;
      v_urgency_fee := 5000; -- 긴급 연결 추가 요금
    WHEN 'deep' THEN 
      v_commission_rate := 15.00; -- 심층 상담 할인
    ELSE 
      v_commission_rate := 20.00; -- 기본 수수료
  END CASE;
  
  -- 수수료 계산
  v_platform_fee := CEIL(p_amount * (v_commission_rate / 100)) + v_urgency_fee;
  v_expert_earning := p_amount - CEIL(p_amount * (v_commission_rate / 100));
  
  RETURN QUERY SELECT v_platform_fee, v_expert_earning, v_commission_rate;
END;
$$;

-- 위기 알림 생성 함수
CREATE OR REPLACE FUNCTION public.create_crisis_alert(
  p_user_id UUID,
  p_alert_type TEXT,
  p_severity_level TEXT,
  p_trigger_source TEXT,
  p_trigger_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  -- 알림 생성
  INSERT INTO public.crisis_alerts (
    user_id, alert_type, severity_level, trigger_source, trigger_data
  ) VALUES (
    p_user_id, p_alert_type, p_severity_level, p_trigger_source, p_trigger_data
  ) RETURNING id INTO v_alert_id;
  
  -- 심각도가 높으면 관리자 알림 생성
  IF p_severity_level IN ('high', 'critical') THEN
    INSERT INTO public.admin_notifications (
      notification_type, title, message, related_id, priority
    ) VALUES (
      'crisis_alert',
      '위기 감지 알림',
      '사용자가 ' || p_trigger_source || '에서 위기 상황이 감지되었습니다.',
      v_alert_id,
      CASE WHEN p_severity_level = 'critical' THEN 'critical' ELSE 'high' END
    );
  END IF;
  
  RETURN v_alert_id;
END;
$$;

-- updated_at 트리거
CREATE TRIGGER update_crisis_alerts_updated_at
BEFORE UPDATE ON public.crisis_alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urgent_requests_updated_at
BEFORE UPDATE ON public.urgent_expert_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();