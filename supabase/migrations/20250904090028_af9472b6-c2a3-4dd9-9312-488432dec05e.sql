-- 추천 시스템 개선: 일일 제한 및 검증 강화

-- 기존 referrals 테이블에 새 컬럼들 추가
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS daily_referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_referral_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ip_address TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 일일 추천 제한을 위한 함수 업데이트
CREATE OR REPLACE FUNCTION public.check_daily_referral_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- 오늘 추천한 횟수 확인
  SELECT COUNT(*) INTO current_count
  FROM public.referrals
  WHERE referrer_id = p_user_id 
    AND DATE(created_at) = today_date;
  
  -- 일일 제한 (3명)을 초과하지 않았는지 확인
  RETURN current_count < 3;
END;
$$;

-- 개선된 추천 보상 처리 함수
CREATE OR REPLACE FUNCTION public.process_referral_reward_v2(p_referral_code text, p_referee_id uuid, p_ip_address text DEFAULT NULL, p_device_fingerprint text DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_record RECORD;
  referrer_tokens_updated INTEGER;
  referee_tokens_updated INTEGER;
  signup_bonus INTEGER := 2;
  referrer_signup_bonus INTEGER := 3;
BEGIN
  -- 추천 코드로 추천 기록 찾기
  SELECT * INTO referral_record
  FROM public.referrals
  WHERE referral_code = p_referral_code 
    AND status = 'pending'
    AND referee_id IS NULL;
  
  -- 추천 기록이 없으면 실패
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', '유효하지 않은 추천 코드입니다.');
  END IF;
  
  -- 자기 자신 추천 방지
  IF referral_record.referrer_id = p_referee_id THEN
    RETURN jsonb_build_object('success', false, 'error', '자신의 추천 코드는 사용할 수 없습니다.');
  END IF;

  -- 일일 추천 제한 확인
  IF NOT public.check_daily_referral_limit(referral_record.referrer_id) THEN
    RETURN jsonb_build_object('success', false, 'error', '추천인의 일일 추천 한도가 초과되었습니다.');
  END IF;

  -- IP/디바이스 중복 체크 (같은 IP에서 하루에 2명 이상 가입 방지)
  IF p_ip_address IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.referrals 
      WHERE ip_address = p_ip_address 
        AND DATE(created_at) = CURRENT_DATE 
        AND status = 'completed'
        AND referee_id != p_referee_id
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', '같은 네트워크에서 오늘 이미 가입한 사용자가 있습니다.');
    END IF;
  END IF;
  
  -- 추천받은 사용자 정보 업데이트 (일단 pending 상태로)
  UPDATE public.referrals
  SET 
    referee_id = p_referee_id,
    status = 'pending_verification',
    tokens_awarded = signup_bonus + referrer_signup_bonus,
    ip_address = p_ip_address,
    device_fingerprint = p_device_fingerprint,
    completed_at = now()
  WHERE id = referral_record.id;
  
  -- 추천받은 사용자에게 즉시 가입 보너스만 지급
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens + signup_bonus,
    total_purchased = total_purchased + signup_bonus,
    referral_bonus = referral_bonus + signup_bonus
  WHERE user_id = p_referee_id;
  
  GET DIAGNOSTICS referee_tokens_updated = ROW_COUNT;
  
  -- 사용량 추적 기록
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES 
    (p_referee_id, 'referral_signup_bonus', CURRENT_DATE, signup_bonus)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + EXCLUDED.count;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', '추천 코드가 적용되었습니다! ' || signup_bonus || '토큰을 받았습니다. 추천인은 7일 후 보상을 받습니다.',
    'referee_bonus', signup_bonus,
    'referrer_pending', referrer_signup_bonus
  );
END;
$$;

-- 7일 후 추천인 보상 지급을 위한 함수
CREATE OR REPLACE FUNCTION public.process_verified_referral_rewards()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  processed_count INTEGER := 0;
  referral_record RECORD;
BEGIN
  -- 7일이 지난 미검증 추천들을 찾아서 처리
  FOR referral_record IN 
    SELECT * FROM public.referrals 
    WHERE status = 'pending_verification' 
      AND completed_at <= now() - INTERVAL '7 days'
  LOOP
    -- 추천받은 사용자가 실제로 활동했는지 확인 (최소 1회 이상 서비스 이용)
    IF EXISTS (
      SELECT 1 FROM public.usage_tracking 
      WHERE user_id = referral_record.referee_id 
        AND created_at >= referral_record.completed_at
        AND count > 0
    ) THEN
      -- 추천인에게 보상 지급
      UPDATE public.user_tokens
      SET 
        current_tokens = current_tokens + 3,
        total_purchased = total_purchased + 3,
        referral_bonus = referral_bonus + 3
      WHERE user_id = referral_record.referrer_id;
      
      -- 추천 상태를 완료로 변경
      UPDATE public.referrals
      SET 
        status = 'completed',
        is_verified = true,
        verified_at = now()
      WHERE id = referral_record.id;
      
      -- 사용량 추적 기록
      INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
      VALUES 
        (referral_record.referrer_id, 'referral_bonus', CURRENT_DATE, 3)
      ON CONFLICT (user_id, feature_type, usage_date)
      DO UPDATE SET count = usage_tracking.count + EXCLUDED.count;
      
      processed_count := processed_count + 1;
    ELSE
      -- 활동하지 않은 경우 추천 무효화
      UPDATE public.referrals
      SET status = 'invalid'
      WHERE id = referral_record.id;
    END IF;
  END LOOP;
  
  RETURN processed_count;
END;
$$;

-- 업데이트된 추천 코드 적용 함수
CREATE OR REPLACE FUNCTION public.apply_referral_code_v2(p_referral_code text, p_user_id uuid, p_ip_address text DEFAULT NULL, p_device_fingerprint text DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- 이미 추천받은 사용자인지 확인
  IF EXISTS(
    SELECT 1 FROM public.referrals 
    WHERE referee_id = p_user_id AND status IN ('completed', 'pending_verification')
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- 새로운 추천 보상 처리 함수 호출
  SELECT public.process_referral_reward_v2(p_referral_code, p_user_id, p_ip_address, p_device_fingerprint) INTO result;
  
  RETURN (result->>'success')::boolean;
END;
$$;