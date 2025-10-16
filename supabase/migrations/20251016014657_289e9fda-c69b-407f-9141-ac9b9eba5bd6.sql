-- 배지 시스템
CREATE TABLE IF NOT EXISTS public.life_achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlock_condition JSONB NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 사용자 배지
CREATE TABLE IF NOT EXISTS public.user_life_achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.life_achievement_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_new BOOLEAN DEFAULT true,
  UNIQUE(user_id, badge_id)
);

-- 리더보드 (주간)
CREATE TABLE IF NOT EXISTS public.life_achievement_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  best_score INTEGER NOT NULL,
  total_tests INTEGER NOT NULL DEFAULT 1,
  improvement INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- 친구 초대
CREATE TABLE IF NOT EXISTS public.life_achievement_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- RLS 정책
ALTER TABLE public.life_achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_life_achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_achievement_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_achievement_invites ENABLE ROW LEVEL SECURITY;

-- 배지는 모두 볼 수 있음
CREATE POLICY "Badges are viewable by everyone"
  ON public.life_achievement_badges FOR SELECT USING (true);

-- 사용자 배지
CREATE POLICY "Users can view their own badges"
  ON public.user_life_achievement_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON public.user_life_achievement_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 리더보드는 모두 볼 수 있음 (익명화)
CREATE POLICY "Leaderboard is viewable by everyone"
  ON public.life_achievement_leaderboard FOR SELECT USING (true);

CREATE POLICY "Users can update their own leaderboard"
  ON public.life_achievement_leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update leaderboard"
  ON public.life_achievement_leaderboard FOR UPDATE
  USING (auth.uid() = user_id);

-- 초대
CREATE POLICY "Users can view their own invites"
  ON public.life_achievement_invites FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invited_user_id);

CREATE POLICY "Users can create invites"
  ON public.life_achievement_invites FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

-- 인덱스
CREATE INDEX idx_user_badges_user_id ON public.user_life_achievement_badges(user_id);
CREATE INDEX idx_leaderboard_week ON public.life_achievement_leaderboard(week_start, best_score DESC);
CREATE INDEX idx_invites_code ON public.life_achievement_invites(invite_code);

-- 기본 배지 데이터
INSERT INTO public.life_achievement_badges (badge_type, name, description, icon, unlock_condition, rarity) VALUES
('first_test', '첫 걸음', '첫 번째 인생 업적 테스트 완료', '🎯', '{"tests_completed": 1}', 'common'),
('score_80', '우수한 삶', '80점 이상 달성', '⭐', '{"min_score": 80}', 'uncommon'),
('score_90', '완벽한 삶', '90점 이상 달성', '🌟', '{"min_score": 90}', 'rare'),
('level_5', '성장하는 자', '레벨 5 달성', '🚀', '{"min_level": 5}', 'uncommon'),
('level_10', '마스터', '레벨 10 달성', '👑', '{"min_level": 10}', 'legendary'),
('consistent_3', '꾸준함', '3회 연속 테스트 완료', '🔥', '{"consecutive_tests": 3}', 'uncommon'),
('all_categories_70', '균형잡힌 삶', '모든 카테고리 70% 이상', '⚖️', '{"all_categories_min": 70}', 'rare'),
('improvement_20', '성장의 증거', '이전 대비 20점 이상 향상', '📈', '{"min_improvement": 20}', 'rare');

-- 리더보드 업데이트 트리거
CREATE OR REPLACE FUNCTION update_life_achievement_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  week_start_date DATE;
  week_end_date DATE;
  prev_best_score INTEGER;
BEGIN
  -- 이번 주의 시작과 끝
  week_start_date := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  week_end_date := (week_start_date + INTERVAL '6 days')::DATE;
  
  -- 이전 최고 점수
  SELECT COALESCE(best_score, 0) INTO prev_best_score
  FROM public.life_achievement_leaderboard
  WHERE user_id = NEW.user_id AND week_start = week_start_date;
  
  -- 리더보드 업데이트
  INSERT INTO public.life_achievement_leaderboard (
    user_id, week_start, week_end, best_score, total_tests, improvement
  ) VALUES (
    NEW.user_id, week_start_date, week_end_date, NEW.total_score, 1, 
    CASE WHEN prev_best_score > 0 THEN NEW.total_score - prev_best_score ELSE 0 END
  )
  ON CONFLICT (user_id, week_start) 
  DO UPDATE SET
    best_score = GREATEST(life_achievement_leaderboard.best_score, NEW.total_score),
    total_tests = life_achievement_leaderboard.total_tests + 1,
    improvement = CASE 
      WHEN NEW.total_score > life_achievement_leaderboard.best_score 
      THEN NEW.total_score - life_achievement_leaderboard.best_score
      ELSE life_achievement_leaderboard.improvement
    END,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_leaderboard
  AFTER INSERT ON public.life_achievement_results
  FOR EACH ROW
  EXECUTE FUNCTION update_life_achievement_leaderboard();

-- 배지 체크 함수
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID, p_result_id UUID)
RETURNS void AS $$
DECLARE
  v_result RECORD;
  v_total_tests INTEGER;
  v_all_categories_above_threshold BOOLEAN;
  v_prev_score INTEGER;
BEGIN
  -- 결과 가져오기
  SELECT * INTO v_result
  FROM public.life_achievement_results
  WHERE id = p_result_id;
  
  -- 총 테스트 수
  SELECT COUNT(*) INTO v_total_tests
  FROM public.life_achievement_results
  WHERE user_id = p_user_id;
  
  -- 첫 테스트 배지
  IF v_total_tests = 1 THEN
    INSERT INTO public.user_life_achievement_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.life_achievement_badges 
    WHERE badge_type = 'first_test'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  -- 점수 배지
  IF v_result.total_score >= 80 THEN
    INSERT INTO public.user_life_achievement_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.life_achievement_badges 
    WHERE badge_type = 'score_80'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  IF v_result.total_score >= 90 THEN
    INSERT INTO public.user_life_achievement_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.life_achievement_badges 
    WHERE badge_type = 'score_90'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  -- 레벨 배지
  IF v_result.level >= 5 THEN
    INSERT INTO public.user_life_achievement_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.life_achievement_badges 
    WHERE badge_type = 'level_5'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  IF v_result.level >= 10 THEN
    INSERT INTO public.user_life_achievement_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.life_achievement_badges 
    WHERE badge_type = 'level_10'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  -- 연속 테스트 배지
  IF v_total_tests >= 3 THEN
    INSERT INTO public.user_life_achievement_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.life_achievement_badges 
    WHERE badge_type = 'consistent_3'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  -- 모든 카테고리 70% 이상
  SELECT bool_and((value->>'percentage')::INTEGER >= 70) INTO v_all_categories_above_threshold
  FROM jsonb_each(v_result.category_scores);
  
  IF v_all_categories_above_threshold THEN
    INSERT INTO public.user_life_achievement_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.life_achievement_badges 
    WHERE badge_type = 'all_categories_70'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  -- 향상 배지
  SELECT total_score INTO v_prev_score
  FROM public.life_achievement_results
  WHERE user_id = p_user_id AND id != p_result_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_prev_score IS NOT NULL AND (v_result.total_score - v_prev_score) >= 20 THEN
    INSERT INTO public.user_life_achievement_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.life_achievement_badges 
    WHERE badge_type = 'improvement_20'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;