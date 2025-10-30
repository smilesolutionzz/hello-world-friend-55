-- 크로스 프로모션 보상 추적 테이블
CREATE TABLE IF NOT EXISTS public.cross_promotion_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL, -- 'memory_legacy', 'make_one_project'
  reward_tokens INTEGER NOT NULL DEFAULT 0,
  reward_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_code TEXT, -- 검증용 코드
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.cross_promotion_rewards ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 보상만 조회 가능
CREATE POLICY "Users can view own rewards"
  ON public.cross_promotion_rewards
  FOR SELECT
  USING (auth.uid() = user_id);

-- 정책: 보상 신청 (INSERT)
CREATE POLICY "Users can claim rewards"
  ON public.cross_promotion_rewards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX idx_cross_promotion_user ON public.cross_promotion_rewards(user_id);
CREATE INDEX idx_cross_promotion_service ON public.cross_promotion_rewards(service_name);

-- 보상 신청 함수
CREATE OR REPLACE FUNCTION public.claim_cross_promotion_reward(
  p_service_name TEXT,
  p_verification_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_reward_tokens INTEGER;
  v_already_claimed BOOLEAN;
BEGIN
  -- 현재 사용자 확인
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', '로그인이 필요합니다.');
  END IF;

  -- 서비스별 보상 토큰 설정
  v_reward_tokens := CASE p_service_name
    WHEN 'memory_legacy' THEN 10
    WHEN 'make_one_project' THEN 15
    ELSE 0
  END;

  IF v_reward_tokens = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', '유효하지 않은 서비스입니다.');
  END IF;

  -- 이미 보상을 받았는지 확인
  SELECT EXISTS(
    SELECT 1 FROM public.cross_promotion_rewards
    WHERE user_id = v_user_id 
    AND service_name = p_service_name
    AND is_claimed = true
  ) INTO v_already_claimed;

  IF v_already_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', '이미 보상을 받으셨습니다.');
  END IF;

  -- 보상 기록
  INSERT INTO public.cross_promotion_rewards (
    user_id,
    service_name,
    reward_tokens,
    verification_code,
    is_claimed
  ) VALUES (
    v_user_id,
    p_service_name,
    v_reward_tokens,
    p_verification_code,
    true
  );

  -- 토큰 지급
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens + v_reward_tokens,
    total_purchased = total_purchased + v_reward_tokens
  WHERE user_id = v_user_id;

  -- 사용량 추적
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (v_user_id, 'cross_promotion_' || p_service_name, CURRENT_DATE, v_reward_tokens)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + EXCLUDED.count;

  RETURN jsonb_build_object(
    'success', true, 
    'reward_tokens', v_reward_tokens,
    'message', v_reward_tokens || '토큰이 지급되었습니다!'
  );
END;
$$;