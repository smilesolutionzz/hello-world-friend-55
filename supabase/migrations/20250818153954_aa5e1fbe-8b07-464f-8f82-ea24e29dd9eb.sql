-- 토큰 기반 구독 시스템을 위한 테이블 생성

-- 구독 플랜 테이블 (토큰 기반)
CREATE TABLE IF NOT EXISTS public.token_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- 원 단위
  yearly_price INTEGER NOT NULL,
  tokens_included INTEGER NOT NULL, -- 포함된 토큰 수 (-1은 무제한)
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 사용자 토큰 보유량 테이블
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_tokens INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 토큰 사용 내역 테이블
CREATE TABLE IF NOT EXISTS public.token_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_type TEXT NOT NULL, -- 'dream_analysis', 'saju_analysis', 'premium_test' 등
  tokens_used INTEGER NOT NULL,
  feature_id UUID, -- 관련 테스트나 분석의 ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 토큰 구매 내역 테이블
CREATE TABLE IF NOT EXISTS public.token_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.token_subscription_plans(id),
  tokens_purchased INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL,
  payment_method TEXT,
  toss_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.token_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_purchases ENABLE ROW LEVEL SECURITY;

-- 구독 플랜은 모든 사용자가 볼 수 있음
CREATE POLICY "Anyone can view active token plans" ON public.token_subscription_plans
FOR SELECT USING (is_active = true);

-- 사용자는 자신의 토큰 정보만 관리 가능
CREATE POLICY "Users can manage their own tokens" ON public.user_tokens
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their token usage history" ON public.token_usage_history
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their token purchases" ON public.token_purchases
FOR SELECT USING (user_id = auth.uid());

-- 시스템이 토큰 사용 내역 삽입 가능
CREATE POLICY "System can insert token usage" ON public.token_usage_history
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert token purchases" ON public.token_purchases
FOR INSERT WITH CHECK (true);

-- 신규 사용자에게 무료 토큰 지급하는 함수
CREATE OR REPLACE FUNCTION public.grant_welcome_tokens()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, current_tokens)
  VALUES (NEW.id, 5) -- 신규 가입자에게 5개 토큰 지급
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 신규 사용자 가입시 자동으로 토큰 지급
CREATE OR REPLACE TRIGGER grant_welcome_tokens_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_welcome_tokens();

-- 토큰 차감 함수
CREATE OR REPLACE FUNCTION public.consume_tokens(
  p_user_id UUID,
  p_feature_type TEXT,
  p_tokens_needed INTEGER,
  p_feature_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  current_balance INTEGER;
  result JSONB;
BEGIN
  -- 현재 토큰 잔액 확인
  SELECT current_tokens INTO current_balance
  FROM public.user_tokens
  WHERE user_id = p_user_id;
  
  -- 토큰이 부족한 경우
  IF current_balance IS NULL OR current_balance < p_tokens_needed THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', '토큰이 부족합니다',
      'current_tokens', COALESCE(current_balance, 0),
      'needed_tokens', p_tokens_needed
    );
  END IF;
  
  -- 토큰 차감
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens - p_tokens_needed,
    total_used = total_used + p_tokens_needed,
    last_used_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- 사용 내역 기록
  INSERT INTO public.token_usage_history (
    user_id, feature_type, tokens_used, feature_id
  ) VALUES (
    p_user_id, p_feature_type, p_tokens_needed, p_feature_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', '토큰이 차감되었습니다',
    'remaining_tokens', current_balance - p_tokens_needed,
    'used_tokens', p_tokens_needed
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 초기 구독 플랜 데이터 삽입
INSERT INTO public.token_subscription_plans (name, price, yearly_price, tokens_included, features, popular) VALUES 
(
  '무료 체험',
  0,
  0,
  5,
  '["3분 테스트 이용", "기본 AI 분석", "간단한 결과 확인"]'::jsonb,
  false
),
(
  'Starter',
  9900,
  99000,
  50,
  '["50개 토큰/월", "모든 3분 테스트", "기본 AI 분석", "이메일 지원"]'::jsonb,
  false
),
(
  'Pro',
  19900,
  199000,
  150,
  '["150개 토큰/월", "모든 테스트 무제한", "심화 AI 분석", "PDF 리포트", "전문가 상담 할인", "우선 지원"]'::jsonb,
  true
),
(
  'Premium',
  39900,
  399000,
  -1,
  '["무제한 토큰", "모든 기능 무제한", "맞춤 리포트", "전문가 개별 해석", "전용 커뮤니티", "1:1 전담 상담"]'::jsonb,
  false
);