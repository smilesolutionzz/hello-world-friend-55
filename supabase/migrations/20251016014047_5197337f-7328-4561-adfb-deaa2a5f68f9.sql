-- 인생 업적 테스트 결과 저장 테이블
CREATE TABLE IF NOT EXISTS public.life_achievement_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  level_name TEXT NOT NULL,
  category_scores JSONB NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.life_achievement_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own results"
  ON public.life_achievement_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
  ON public.life_achievement_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_life_achievement_results_user_id 
  ON public.life_achievement_results(user_id);

CREATE INDEX IF NOT EXISTS idx_life_achievement_results_created_at 
  ON public.life_achievement_results(created_at DESC);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_life_achievement_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_life_achievement_results_updated_at
  BEFORE UPDATE ON public.life_achievement_results
  FOR EACH ROW
  EXECUTE FUNCTION update_life_achievement_results_updated_at();