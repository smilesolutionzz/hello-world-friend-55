-- 구독 플랜 테이블 생성
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  yearly_price INTEGER,
  features TEXT[] DEFAULT '{}',
  type TEXT NOT NULL DEFAULT 'paid',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 구독 플랜을 볼 수 있도록 정책 생성
CREATE POLICY "구독 플랜 조회 가능" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- 기본 구독 플랜 데이터 삽입
INSERT INTO public.subscription_plans (name, description, price, yearly_price, features, type) VALUES
('무료', '기본 기능을 체험해보세요', 0, NULL, ARRAY['월 3회 심리검사', 'AIH 기본 분석', '결과 요약'], 'free'),
('프리미엄', '개인 사용자를 위한 완벽한 선택', 9900, 99000, ARRAY['무제한 심리검사', 'AIH 상세 분석', '결과 저장', 'PDF 리포트', '24/7 지원'], 'premium');

-- 결제 내역 테이블 생성 (토스페이먼츠용)
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  toss_order_id TEXT NOT NULL,
  payment_key TEXT,
  plan_id UUID REFERENCES public.subscription_plans(id),
  subscription_id UUID,
  amount INTEGER NOT NULL,
  subscription_type TEXT DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 결제 내역만 볼 수 있도록 정책 생성
CREATE POLICY "사용자 결제 내역 조회" ON public.payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- 시스템이 결제 내역을 생성/수정할 수 있도록 정책 생성
CREATE POLICY "결제 내역 생성" ON public.payment_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "결제 내역 업데이트" ON public.payment_history
  FOR UPDATE USING (true);

-- 사용자 구독 테이블 생성
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  subscription_type TEXT DEFAULT 'monthly',
  payment_method TEXT DEFAULT 'toss',
  current_period_start DATE,
  current_period_end DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 구독만 볼 수 있도록 정책 생성
CREATE POLICY "사용자 구독 조회" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 시스템이 구독을 생성/수정할 수 있도록 정책 생성
CREATE POLICY "구독 생성" ON public.user_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "구독 업데이트" ON public.user_subscriptions
  FOR UPDATE USING (true);

-- 업데이트 시간 자동 업데이트 트리거
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at
  BEFORE UPDATE ON public.payment_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();