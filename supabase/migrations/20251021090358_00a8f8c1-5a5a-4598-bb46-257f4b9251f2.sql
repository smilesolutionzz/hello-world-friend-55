-- 토스페이먼츠 결제 내역 테이블
CREATE TABLE IF NOT EXISTS public.toss_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_key TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  tokens_purchased INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_reason TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.toss_payments ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 결제 내역만 조회 가능
CREATE POLICY "Users can view their own payments"
  ON public.toss_payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_toss_payments_user_id ON public.toss_payments(user_id);
CREATE INDEX idx_toss_payments_order_id ON public.toss_payments(order_id);
CREATE INDEX idx_toss_payments_payment_key ON public.toss_payments(payment_key);

-- 업데이트 트리거
CREATE TRIGGER update_toss_payments_updated_at
  BEFORE UPDATE ON public.toss_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- update_updated_at_column 함수가 없다면 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;