-- 추천 시스템을 위한 테이블 생성
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referee_id UUID,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, expired
  tokens_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS 정책 활성화
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 추천자는 자신의 추천 기록을 볼 수 있음
CREATE POLICY "Users can view their own referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- 추천자는 자신의 추천 코드를 생성할 수 있음
CREATE POLICY "Users can create their own referrals"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referrer_id);

-- 시스템이 추천 상태를 업데이트할 수 있음
CREATE POLICY "System can update referral status"
ON public.referrals
FOR UPDATE
USING (true);

-- 추천 코드 생성 함수
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- 6자리 랜덤 코드 생성 (영문 대문자 + 숫자)
    code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));
    
    -- 중복 체크
    SELECT COUNT(*) INTO exists_check 
    FROM public.referrals 
    WHERE referral_code = code;
    
    -- 중복이 없으면 루프 종료
    IF exists_check = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- 추천 보상 처리 함수
CREATE OR REPLACE FUNCTION public.process_referral_reward(p_referral_code TEXT, p_referee_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referral_record RECORD;
  referrer_tokens_updated INTEGER;
  referee_tokens_updated INTEGER;
BEGIN
  -- 추천 코드로 추천 기록 찾기
  SELECT * INTO referral_record
  FROM public.referrals
  WHERE referral_code = p_referral_code 
    AND status = 'pending'
    AND referee_id IS NULL;
  
  -- 추천 기록이 없으면 실패
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- 자기 자신 추천 방지
  IF referral_record.referrer_id = p_referee_id THEN
    RETURN FALSE;
  END IF;
  
  -- 추천받은 사용자 정보 업데이트
  UPDATE public.referrals
  SET 
    referee_id = p_referee_id,
    status = 'completed',
    tokens_awarded = 10,
    completed_at = now()
  WHERE id = referral_record.id;
  
  -- 추천자에게 10토큰 지급
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens + 10,
    total_purchased = total_purchased + 10,
    referral_bonus = referral_bonus + 10
  WHERE user_id = referral_record.referrer_id;
  
  GET DIAGNOSTICS referrer_tokens_updated = ROW_COUNT;
  
  -- 추천받은 사용자에게도 추가 토큰 지급 (가입 보너스 외 추가)
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens + 5,
    total_purchased = total_purchased + 5,
    referral_bonus = referral_bonus + 5
  WHERE user_id = p_referee_id;
  
  GET DIAGNOSTICS referee_tokens_updated = ROW_COUNT;
  
  -- 사용량 추적 기록
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES 
    (referral_record.referrer_id, 'referral_bonus', CURRENT_DATE, 10),
    (p_referee_id, 'referral_signup_bonus', CURRENT_DATE, 5)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + EXCLUDED.count;
  
  RETURN (referrer_tokens_updated > 0 AND referee_tokens_updated > 0);
END;
$$;

-- 기존 사용자가 추천 코드를 입력했을 때 처리하는 함수
CREATE OR REPLACE FUNCTION public.apply_referral_code(p_referral_code TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referral_record RECORD;
  user_already_referred BOOLEAN;
BEGIN
  -- 이미 추천받은 사용자인지 확인
  SELECT EXISTS(
    SELECT 1 FROM public.referrals 
    WHERE referee_id = p_user_id AND status = 'completed'
  ) INTO user_already_referred;
  
  -- 이미 추천받은 사용자면 실패
  IF user_already_referred THEN
    RETURN FALSE;
  END IF;
  
  -- 추천 코드로 추천 기록 찾기
  SELECT * INTO referral_record
  FROM public.referrals
  WHERE referral_code = p_referral_code 
    AND status = 'pending'
    AND referee_id IS NULL;
  
  -- 추천 기록이 없으면 실패
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- 자기 자신 추천 방지
  IF referral_record.referrer_id = p_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- 추천 보상 처리
  RETURN public.process_referral_reward(p_referral_code, p_user_id);
END;
$$;