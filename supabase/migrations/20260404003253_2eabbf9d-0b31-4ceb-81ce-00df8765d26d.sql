
-- 리워드 포인트 테이블
CREATE TABLE public.user_reward_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 리워드 히스토리
CREATE TABLE public.reward_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'attendance', 'roulette', 'referral', 'assessment_complete', 'report_complete', 'exchange'
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 출석 체크
CREATE TABLE public.reward_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_days INTEGER NOT NULL DEFAULT 1,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_date)
);

-- 룰렛 스핀
CREATE TABLE public.reward_roulette_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_won INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, spin_date)
);

-- RLS 활성화
ALTER TABLE public.user_reward_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_roulette_spins ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인 데이터만 접근
CREATE POLICY "Users can view own reward points" ON public.user_reward_points FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reward points" ON public.user_reward_points FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reward points" ON public.user_reward_points FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reward history" ON public.reward_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reward history" ON public.reward_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own attendance" ON public.reward_attendance FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attendance" ON public.reward_attendance FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own roulette spins" ON public.reward_roulette_spins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roulette spins" ON public.reward_roulette_spins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- updated_at 트리거
CREATE TRIGGER update_user_reward_points_updated_at BEFORE UPDATE ON public.user_reward_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 포인트 적립/차감 함수
CREATE OR REPLACE FUNCTION public.add_reward_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', '인증이 필요합니다.');
  END IF;

  -- 포인트 레코드 없으면 생성
  INSERT INTO public.user_reward_points (user_id, balance, total_earned)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- 포인트 업데이트
  UPDATE public.user_reward_points
  SET 
    balance = balance + p_points,
    total_earned = CASE WHEN p_points > 0 THEN total_earned + p_points ELSE total_earned END,
    total_spent = CASE WHEN p_points < 0 THEN total_spent + ABS(p_points) ELSE total_spent END
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  -- 히스토리 기록
  INSERT INTO public.reward_history (user_id, points, action_type, description, metadata)
  VALUES (p_user_id, p_points, p_action_type, p_description, p_metadata);

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'points_added', p_points);
END;
$$;

-- 출석 체크 함수
CREATE OR REPLACE FUNCTION public.check_attendance(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already_checked BOOLEAN;
  v_yesterday_streak INTEGER;
  v_new_streak INTEGER;
  v_points INTEGER;
  v_result JSONB;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', '인증이 필요합니다.');
  END IF;

  -- 오늘 이미 출석했는지
  SELECT EXISTS(
    SELECT 1 FROM public.reward_attendance WHERE user_id = p_user_id AND check_date = CURRENT_DATE
  ) INTO v_already_checked;

  IF v_already_checked THEN
    RETURN jsonb_build_object('success', false, 'error', '오늘은 이미 출석했습니다.');
  END IF;

  -- 어제 연속 출석 일수
  SELECT COALESCE(streak_days, 0) INTO v_yesterday_streak
  FROM public.reward_attendance
  WHERE user_id = p_user_id AND check_date = CURRENT_DATE - 1;

  v_new_streak := COALESCE(v_yesterday_streak, 0) + 1;

  -- 연속 출석 보너스 포인트
  v_points := CASE
    WHEN v_new_streak >= 7 THEN 50
    WHEN v_new_streak >= 5 THEN 30
    WHEN v_new_streak >= 3 THEN 20
    ELSE 10
  END;

  -- 출석 기록
  INSERT INTO public.reward_attendance (user_id, check_date, streak_days, points_earned)
  VALUES (p_user_id, CURRENT_DATE, v_new_streak, v_points);

  -- 포인트 적립
  SELECT public.add_reward_points(p_user_id, v_points, 'attendance', v_new_streak || '일 연속 출석') INTO v_result;

  RETURN jsonb_build_object(
    'success', true,
    'streak', v_new_streak,
    'points', v_points,
    'balance', (v_result->>'new_balance')::integer
  );
END;
$$;

-- 룰렛 스핀 함수
CREATE OR REPLACE FUNCTION public.spin_roulette(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already_spun BOOLEAN;
  v_random FLOAT;
  v_points INTEGER;
  v_result JSONB;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', '인증이 필요합니다.');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.reward_roulette_spins WHERE user_id = p_user_id AND spin_date = CURRENT_DATE
  ) INTO v_already_spun;

  IF v_already_spun THEN
    RETURN jsonb_build_object('success', false, 'error', '오늘은 이미 룰렛을 돌렸습니다.');
  END IF;

  v_random := random();
  v_points := CASE
    WHEN v_random < 0.01 THEN 500   -- 1% 확률 대박
    WHEN v_random < 0.05 THEN 200   -- 4%
    WHEN v_random < 0.15 THEN 100   -- 10%
    WHEN v_random < 0.35 THEN 50    -- 20%
    WHEN v_random < 0.65 THEN 30    -- 30%
    ELSE 10                          -- 35%
  END;

  INSERT INTO public.reward_roulette_spins (user_id, spin_date, points_won)
  VALUES (p_user_id, CURRENT_DATE, v_points);

  SELECT public.add_reward_points(p_user_id, v_points, 'roulette', '룰렛 보상 ₩' || v_points) INTO v_result;

  RETURN jsonb_build_object(
    'success', true,
    'points_won', v_points,
    'balance', (v_result->>'new_balance')::integer
  );
END;
$$;
