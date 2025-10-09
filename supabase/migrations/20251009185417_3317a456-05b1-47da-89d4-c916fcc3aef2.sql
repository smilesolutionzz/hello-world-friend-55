-- 예방 건강 점수 테이블 생성
CREATE TABLE IF NOT EXISTS public.wellness_prevention_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  score_level TEXT NOT NULL CHECK (score_level IN ('우수', '양호', '주의', '위험')),
  current_status TEXT NOT NULL,
  risk_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
  predictions JSONB NOT NULL DEFAULT '{}'::jsonb,
  prevention_tips TEXT[] DEFAULT ARRAY[]::TEXT[],
  key_message TEXT,
  analysis_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 정책 활성화
ALTER TABLE public.wellness_prevention_scores ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 점수만 조회 가능
CREATE POLICY "Users can view own prevention scores"
  ON public.wellness_prevention_scores
  FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 점수만 삽입 가능
CREATE POLICY "Users can insert own prevention scores"
  ON public.wellness_prevention_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_prevention_scores_user_id 
  ON public.wellness_prevention_scores(user_id);

CREATE INDEX IF NOT EXISTS idx_prevention_scores_created_at 
  ON public.wellness_prevention_scores(created_at DESC);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_prevention_score_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_prevention_score_timestamp
  BEFORE UPDATE ON public.wellness_prevention_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prevention_score_updated_at();