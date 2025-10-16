-- Phase 4: Goal Tracking & Social Sharing Tables

-- 목표 테이블
CREATE TABLE IF NOT EXISTS public.life_achievement_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result_id UUID REFERENCES public.life_achievement_results(id) ON DELETE SET NULL,
  goal_text TEXT NOT NULL,
  category TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 목표 진행상황 추적
CREATE TABLE IF NOT EXISTS public.life_achievement_goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.life_achievement_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_life_achievement_goals_user ON public.life_achievement_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_life_achievement_goals_completed ON public.life_achievement_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_life_achievement_goal_progress_goal ON public.life_achievement_goal_progress(goal_id);

-- RLS 정책
ALTER TABLE public.life_achievement_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_achievement_goal_progress ENABLE ROW LEVEL SECURITY;

-- 목표 정책
CREATE POLICY "Users can view their own goals"
  ON public.life_achievement_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON public.life_achievement_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.life_achievement_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.life_achievement_goals FOR DELETE
  USING (auth.uid() = user_id);

-- 진행상황 정책
CREATE POLICY "Users can view their own progress"
  ON public.life_achievement_goal_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON public.life_achievement_goal_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_life_achievement_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_life_achievement_goals_updated_at
  BEFORE UPDATE ON public.life_achievement_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_life_achievement_goals_updated_at();