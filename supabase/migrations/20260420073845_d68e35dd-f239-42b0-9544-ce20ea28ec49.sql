-- 챌린지 baseline 데이터 테이블 (검사 결과 → 30일 챌린지 연동)
CREATE TABLE IF NOT EXISTS public.challenge_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_test_type TEXT NOT NULL,
  source_test_id UUID,
  baseline_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  strength_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommended_focus TEXT,
  challenge_started BOOLEAN DEFAULT false,
  challenge_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own baselines"
  ON public.challenge_baselines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own baselines"
  ON public.challenge_baselines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own baselines"
  ON public.challenge_baselines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all baselines"
  ON public.challenge_baselines FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_challenge_baselines_user ON public.challenge_baselines(user_id, created_at DESC);

CREATE TRIGGER update_challenge_baselines_updated_at
  BEFORE UPDATE ON public.challenge_baselines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();