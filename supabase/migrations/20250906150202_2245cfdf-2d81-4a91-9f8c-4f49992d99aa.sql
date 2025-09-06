-- 성장 스토리 테이블
CREATE TABLE public.growth_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  before_story TEXT NOT NULL,
  after_story TEXT NOT NULL,
  transformation_date DATE,
  category TEXT DEFAULT 'personal',
  media_urls JSONB DEFAULT '[]'::jsonb,
  likes_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 고민 해결 챌린지 테이블
CREATE TABLE public.challenge_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  points_reward INTEGER DEFAULT 10,
  solved_by UUID,
  solution TEXT,
  solved_at TIMESTAMP WITH TIME ZONE,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 반전 일기 테이블
CREATE TABLE public.reversal_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  worst_moment TEXT NOT NULL,
  reversal_moment TEXT NOT NULL,
  lesson_learned TEXT,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  story_date DATE,
  reactions JSONB DEFAULT '{"inspiring": 0, "relatable": 0, "helpful": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 사용자 성장 포인트 테이블
CREATE TABLE public.user_growth_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  story_points INTEGER DEFAULT 0,
  challenge_points INTEGER DEFAULT 0,
  reversal_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_rank INTEGER,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책들
ALTER TABLE public.growth_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reversal_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_growth_points ENABLE ROW LEVEL SECURITY;

-- Growth Stories 정책
CREATE POLICY "Users can view all growth stories" 
ON public.growth_stories FOR SELECT USING (true);

CREATE POLICY "Users can create their own growth stories" 
ON public.growth_stories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth stories" 
ON public.growth_stories FOR UPDATE 
USING (auth.uid() = user_id);

-- Challenge Posts 정책
CREATE POLICY "Users can view all challenge posts" 
ON public.challenge_posts FOR SELECT USING (true);

CREATE POLICY "Users can create challenge posts" 
ON public.challenge_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts or solve others" 
ON public.challenge_posts FOR UPDATE 
USING (auth.uid() = user_id OR (status = 'open' AND auth.uid() = solved_by));

-- Reversal Stories 정책
CREATE POLICY "Users can view all reversal stories" 
ON public.reversal_stories FOR SELECT USING (true);

CREATE POLICY "Users can create their own reversal stories" 
ON public.reversal_stories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reversal stories" 
ON public.reversal_stories FOR UPDATE 
USING (auth.uid() = user_id);

-- User Growth Points 정책
CREATE POLICY "Users can view growth points leaderboard" 
ON public.user_growth_points FOR SELECT USING (true);

CREATE POLICY "Users can manage their own growth points" 
ON public.user_growth_points FOR ALL 
USING (auth.uid() = user_id);

-- 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_growth_points_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_points = NEW.story_points + NEW.challenge_points + NEW.reversal_points;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_growth_points_total_trigger
  BEFORE UPDATE ON public.user_growth_points
  FOR EACH ROW EXECUTE FUNCTION update_growth_points_total();

-- 초기 성장 포인트 레코드 생성 함수
CREATE OR REPLACE FUNCTION ensure_user_growth_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_growth_points (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;