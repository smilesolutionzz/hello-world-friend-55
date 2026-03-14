-- 단건 리포트 구매 크레딧 테이블
CREATE TABLE IF NOT EXISTS public.user_report_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits integer NOT NULL DEFAULT 1,
  used_credits integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'single_purchase',
  payment_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);

ALTER TABLE public.user_report_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON public.user_report_credits FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert credits"
  ON public.user_report_credits FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can update own credits"
  ON public.user_report_credits FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_user_report_credits_user_id ON public.user_report_credits(user_id);
CREATE INDEX idx_user_report_credits_available ON public.user_report_credits(user_id) WHERE used_credits < credits;