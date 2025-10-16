-- Phase 5: Weekly Reports & Achievement Sharing

-- 주간/월간 리포트 테이블
CREATE TABLE IF NOT EXISTS public.life_achievement_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_tests INTEGER DEFAULT 0,
  average_score NUMERIC DEFAULT 0,
  improvement_rate NUMERIC DEFAULT 0,
  top_category TEXT,
  goals_completed INTEGER DEFAULT 0,
  goals_total INTEGER DEFAULT 0,
  ai_insights TEXT,
  summary_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 업적 공유 테이블
CREATE TABLE IF NOT EXISTS public.life_achievement_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL CHECK (share_type IN ('goal_completed', 'milestone', 'badge_earned', 'weekly_report')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  achievement_data JSONB DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 공유 좋아요 테이블
CREATE TABLE IF NOT EXISTS public.life_achievement_share_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public.life_achievement_shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(share_id, user_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_life_achievement_reports_user ON public.life_achievement_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_life_achievement_reports_period ON public.life_achievement_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_life_achievement_shares_user ON public.life_achievement_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_life_achievement_shares_public ON public.life_achievement_shares(is_public);
CREATE INDEX IF NOT EXISTS idx_life_achievement_share_likes_share ON public.life_achievement_share_likes(share_id);

-- RLS 정책
ALTER TABLE public.life_achievement_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_achievement_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_achievement_share_likes ENABLE ROW LEVEL SECURITY;

-- 리포트 정책
CREATE POLICY "Users can view their own reports"
  ON public.life_achievement_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON public.life_achievement_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 공유 정책
CREATE POLICY "Users can view public shares"
  ON public.life_achievement_shares FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own shares"
  ON public.life_achievement_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shares"
  ON public.life_achievement_shares FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares"
  ON public.life_achievement_shares FOR DELETE
  USING (auth.uid() = user_id);

-- 좋아요 정책
CREATE POLICY "Users can view all likes"
  ON public.life_achievement_share_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like shares"
  ON public.life_achievement_share_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike shares"
  ON public.life_achievement_share_likes FOR DELETE
  USING (auth.uid() = user_id);

-- 좋아요 수 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_share_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.life_achievement_shares 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.share_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.life_achievement_shares 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.share_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_share_likes_count_trigger
  AFTER INSERT OR DELETE ON public.life_achievement_share_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_share_likes_count();