
-- 1. 신규 전문가 상담 패키지 카탈로그 (기존 consultation_packages와 분리)
CREATE TABLE IF NOT EXISTS public.expert_consultation_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('kakao', 'zoom', 'phone', 'in_person')),
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  validity_days INTEGER,
  base_price INTEGER NOT NULL,
  monthly_subscriber_price INTEGER NOT NULL,
  yearly_subscriber_price INTEGER NOT NULL,
  is_emergency BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.expert_consultation_offerings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offerings_public_read" ON public.expert_consultation_offerings;
CREATE POLICY "offerings_public_read"
ON public.expert_consultation_offerings FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "offerings_admin_manage" ON public.expert_consultation_offerings;
CREATE POLICY "offerings_admin_manage"
ON public.expert_consultation_offerings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.expert_consultation_offerings 
  (offering_key, name, description, channel, duration_minutes, validity_days, base_price, monthly_subscriber_price, yearly_subscriber_price, is_emergency, display_order)
VALUES
  ('kakao_async', '카톡 비동기 상담 (3일)', '3일간 카톡으로 전문가와 자유롭게 대화. 가장 부담 없는 시작.', 'kakao', 0, 3, 9900, 6900, 4900, false, 1),
  ('urgent_zoom_15', '15분 긴급 줌 콜', '위기 상황 즉시 매칭. 15분 압축 상담.', 'zoom', 15, NULL, 19900, 13900, 9900, true, 2),
  ('report_review_30', '리포트 해석 상담 30분', '프리미엄 리포트를 들고 가는 1:1 줌 해석 상담.', 'zoom', 30, NULL, 49000, 34300, 24500, false, 3),
  ('monthly_coaching', '월 정기 코칭 (4회)', '주 1회 30분 줌 코칭. LTV 락인 패키지.', 'zoom', 30, 30, 159000, 119000, 79000, false, 4)
ON CONFLICT (offering_key) DO NOTHING;

-- 2. 사용자 무료 상담권
CREATE TABLE IF NOT EXISTS public.user_consultation_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  offering_key TEXT NOT NULL,
  credit_amount INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  used_booking_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_consultation_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credits_owner_read" ON public.user_consultation_credits;
CREATE POLICY "credits_owner_read"
ON public.user_consultation_credits FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "credits_owner_update" ON public.user_consultation_credits;
CREATE POLICY "credits_owner_update"
ON public.user_consultation_credits FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "credits_owner_insert" ON public.user_consultation_credits;
CREATE POLICY "credits_owner_insert"
ON public.user_consultation_credits FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_consultation_credits_user_active 
ON public.user_consultation_credits(user_id, used_at, expires_at);

-- 3. AI 매칭 로그
CREATE TABLE IF NOT EXISTS public.ai_consultation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  concern_text TEXT NOT NULL,
  detected_category TEXT,
  detected_severity TEXT,
  recommended_expert_ids UUID[],
  recommended_offering_key TEXT,
  trigger_source TEXT,
  selected_expert_id UUID,
  resulted_in_booking_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_consultation_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_owner_read" ON public.ai_consultation_matches;
CREATE POLICY "matches_owner_read"
ON public.ai_consultation_matches FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "matches_insert" ON public.ai_consultation_matches;
CREATE POLICY "matches_insert"
ON public.ai_consultation_matches FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "matches_owner_update" ON public.ai_consultation_matches;
CREATE POLICY "matches_owner_update"
ON public.ai_consultation_matches FOR UPDATE
USING (auth.uid() = user_id);

-- 4. consultation_bookings 컬럼 확장
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='consultation_bookings' AND column_name='offering_key') THEN
    ALTER TABLE public.consultation_bookings ADD COLUMN offering_key TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='consultation_bookings' AND column_name='credit_used_id') THEN
    ALTER TABLE public.consultation_bookings ADD COLUMN credit_used_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='consultation_bookings' AND column_name='channel') THEN
    ALTER TABLE public.consultation_bookings ADD COLUMN channel TEXT DEFAULT 'zoom';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='consultation_bookings' AND column_name='is_emergency') THEN
    ALTER TABLE public.consultation_bookings ADD COLUMN is_emergency BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 5. 구독자 무료 상담권 자동 발급 함수
CREATE OR REPLACE FUNCTION public.grant_subscriber_consultation_credit(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credit_id UUID;
  v_recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_recent_count
  FROM public.user_consultation_credits
  WHERE user_id = p_user_id
    AND source = 'monthly_subscriber_bonus'
    AND granted_at > now() - INTERVAL '28 days';

  IF v_recent_count > 0 THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = p_user_id AND status = 'active'
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.user_consultation_credits 
    (user_id, offering_key, credit_amount, source, expires_at)
  VALUES 
    (p_user_id, 'kakao_async', 1, 'monthly_subscriber_bonus', now() + INTERVAL '30 days')
  RETURNING id INTO v_credit_id;

  RETURN v_credit_id;
END;
$$;

-- 6. updated_at 트리거
DROP TRIGGER IF EXISTS update_expert_consultation_offerings_updated_at ON public.expert_consultation_offerings;
CREATE TRIGGER update_expert_consultation_offerings_updated_at
BEFORE UPDATE ON public.expert_consultation_offerings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
