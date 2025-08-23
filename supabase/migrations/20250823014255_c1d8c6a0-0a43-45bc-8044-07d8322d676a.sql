-- 기존 복잡한 테이블들 모두 제거
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE; 
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.token_purchases CASCADE;
DROP TABLE IF EXISTS public.token_subscription_plans CASCADE;
DROP TABLE IF EXISTS public.user_tokens CASCADE;

-- 새로운 깔끔한 토큰 시스템
-- 1. 토큰 패키지 정보
CREATE TABLE public.token_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  token_count INTEGER NOT NULL,
  price_krw INTEGER NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. 사용자 토큰 잔액
CREATE TABLE public.user_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_tokens INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. 토큰 구매 내역
CREATE TABLE public.token_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.token_packages(id),
  order_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  tokens_purchased INTEGER NOT NULL,
  payment_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_orders ENABLE ROW LEVEL SECURITY;

-- RLS 정책
-- 토큰 패키지는 모든 사용자가 볼 수 있음
CREATE POLICY "token_packages_select" ON public.token_packages
  FOR SELECT USING (is_active = true);

-- 사용자는 자신의 토큰만 관리
CREATE POLICY "user_tokens_select" ON public.user_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_tokens_insert" ON public.user_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_tokens_update" ON public.user_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 주문만 관리
CREATE POLICY "token_orders_select" ON public.token_orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "token_orders_insert" ON public.token_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 기본 토큰 패키지 데이터 추가
INSERT INTO public.token_packages (name, description, token_count, price_krw, is_popular) VALUES
('스타터 팩', '기본적인 AI 분석을 위한 토큰 팩', 50, 9900, false),
('프리미엄 팩', '종합적인 AI 분석을 위한 인기 토큰 팩', 200, 24900, true),
('프로 팩', '전문가용 대용량 토큰 팩', 1000, 99000, false);

-- 기존 사용자들에게 기본 토큰 지급
INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased)
SELECT id, 10, 10 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;