
-- 검사 크레딧 테이블 (user_report_credits와 동일 구조)
CREATE TABLE public.user_test_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 1,
  used_credits INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'single_purchase',
  payment_id UUID,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.user_test_credits ENABLE ROW LEVEL SECURITY;

-- 본인만 조회 가능
CREATE POLICY "Users can view own test credits"
  ON public.user_test_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 서비스 역할만 삽입/수정 (Edge Function용)
CREATE POLICY "Service role can manage test credits"
  ON public.user_test_credits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 사용자 본인이 used_credits만 업데이트 가능
CREATE POLICY "Users can update own test credits usage"
  ON public.user_test_credits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_user_test_credits_user_id ON public.user_test_credits(user_id);
