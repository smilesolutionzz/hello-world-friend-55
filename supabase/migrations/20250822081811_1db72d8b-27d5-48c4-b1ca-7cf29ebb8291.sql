-- Create token subscription plans table
CREATE TABLE IF NOT EXISTS public.token_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  token_count INTEGER NOT NULL,
  price_krw INTEGER NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.token_subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "token_subscription_plans_select" ON public.token_subscription_plans
FOR SELECT
USING (is_active = true);

-- Create token purchases table for tracking purchases
CREATE TABLE IF NOT EXISTS public.token_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.token_subscription_plans(id),
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  toss_payment_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.token_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for token purchases
CREATE POLICY "token_purchases_select" ON public.token_purchases
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "token_purchases_insert" ON public.token_purchases
FOR INSERT
WITH CHECK (true);

CREATE POLICY "token_purchases_update" ON public.token_purchases
FOR UPDATE
USING (true);

-- Create user tokens table if not exists
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_tokens INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  referral_bonus INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for user tokens
CREATE POLICY "user_tokens_select" ON public.user_tokens
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "user_tokens_insert" ON public.user_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_tokens_update" ON public.user_tokens
FOR UPDATE
USING (true);

-- Insert token subscription plans
INSERT INTO public.token_subscription_plans (name, token_count, price_krw, is_popular, description, features) VALUES
('스타터 팩', 50, 9900, false, '기본적인 AI 분석을 위한 토큰 팩', '["50개 토큰", "기본 AI 분석", "7일 이용권"]'),
('프리미엄 팩', 200, 24900, true, '종합적인 AI 분석을 위한 인기 토큰 팩', '["200개 토큰", "고급 AI 분석", "전문가 매칭", "30일 이용권"]'),
('프로 팩', 1000, 99000, false, '전문가용 대용량 토큰 팩', '["1000개 토큰", "무제한 AI 분석", "전문가 상담", "90일 이용권", "우선 지원"]');

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_token_subscription_plans_updated_at
BEFORE UPDATE ON public.token_subscription_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_purchases_updated_at
BEFORE UPDATE ON public.token_purchases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tokens_updated_at
BEFORE UPDATE ON public.user_tokens
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();