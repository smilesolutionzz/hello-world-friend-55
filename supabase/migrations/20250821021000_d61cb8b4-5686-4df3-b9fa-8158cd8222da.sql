-- 구독 타입 enum 생성
CREATE TYPE public.subscription_type AS ENUM ('free', 'token_pack', 'monthly_unlimited');

-- 구독 플랜 테이블 생성
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type subscription_type NOT NULL,
  price_monthly INTEGER, -- 월 가격 (센트 단위)
  price_yearly INTEGER,  -- 연 가격 (센트 단위)
  token_count INTEGER,   -- 토큰 패키지인 경우 포함된 토큰 수
  features JSONB,        -- 포함된 기능들
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 사용자 구독 정보 테이블 생성
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type subscription_type NOT NULL DEFAULT 'free',
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 사용량 추적 테이블 생성
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'assessment', 'analysis', 'consultation'
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_type, usage_date)
);

-- RLS 정책 활성화
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- 구독 플랜은 모든 사용자가 조회 가능
CREATE POLICY "subscription_plans_select" ON public.subscription_plans
FOR SELECT USING (true);

-- 사용자는 자신의 구독 정보만 조회/수정 가능
CREATE POLICY "user_subscriptions_select" ON public.user_subscriptions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_subscriptions_update" ON public.user_subscriptions
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_subscriptions_insert" ON public.user_subscriptions
FOR INSERT WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 사용량만 조회/수정 가능
CREATE POLICY "usage_tracking_select" ON public.usage_tracking
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "usage_tracking_insert" ON public.usage_tracking
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "usage_tracking_update" ON public.usage_tracking
FOR UPDATE USING (user_id = auth.uid());

-- 기본 구독 플랜 데이터 삽입
INSERT INTO public.subscription_plans (name, type, price_monthly, price_yearly, token_count, features) VALUES
-- 무료 플랜
('무료 체험', 'free', 0, 0, 0, '{"monthly_assessments": 1, "basic_analysis": true, "community_support": true}'),
-- 토큰 팩
('스타터 토큰팩', 'token_pack', 9900, null, 10, '{"assessments": "unlimited", "ai_analysis": true, "priority_support": true}'),
('프로 토큰팩', 'token_pack', 19900, null, 25, '{"assessments": "unlimited", "ai_analysis": true, "expert_consultation": 1, "priority_support": true}'),
('프리미엄 토큰팩', 'token_pack', 39900, null, 60, '{"assessments": "unlimited", "ai_analysis": true, "expert_consultation": 3, "priority_support": true, "family_tracking": true}'),
-- 월 구독
('월간 무제한', 'monthly_unlimited', 29900, 299000, null, '{"assessments": "unlimited", "ai_analysis": "unlimited", "expert_consultation": 2, "priority_support": true, "family_tracking": true, "trend_analysis": true}');

-- 업데이트 트리거 생성
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 새 사용자 생성 시 무료 구독 자동 할당 함수
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- 무료 플랜 ID 가져오기
  INSERT INTO public.user_subscriptions (user_id, subscription_type, plan_id)
  SELECT NEW.user_id, 'free', id 
  FROM subscription_plans 
  WHERE type = 'free' 
  LIMIT 1;
  RETURN NEW;
END;
$function$;

-- 프로파일 생성 후 구독 정보 생성 트리거
CREATE TRIGGER on_profile_created_subscription
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_subscription();

-- 사용량 추적 함수
CREATE OR REPLACE FUNCTION public.track_feature_usage(
  p_user_id UUID,
  p_feature_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (p_user_id, p_feature_type, CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + 1;
END;
$function$;

-- 사용자의 월간 사용량 체크 함수
CREATE OR REPLACE FUNCTION public.get_monthly_usage(
  p_user_id UUID,
  p_feature_type TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(count), 0)
  INTO usage_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND usage_date >= DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN usage_count;
END;
$function$;