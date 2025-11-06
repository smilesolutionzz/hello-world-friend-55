-- process_referral_reward_v2 함수 수정: 추천 보상은 referral_bonus에만 기록하고 total_purchased에 포함하지 않음
CREATE OR REPLACE FUNCTION public.process_referral_reward_v2(p_referral_code text, p_referee_id uuid, p_ip_address text DEFAULT NULL::text, p_device_fingerprint text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referral_record RECORD;
  signup_bonus INTEGER := 2;
  referrer_signup_bonus INTEGER := 3;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_referee_id THEN
    RETURN jsonb_build_object('success', false, 'error', '권한이 없습니다.');
  END IF;

  SELECT * INTO referral_record
  FROM public.referrals
  WHERE referral_code = p_referral_code 
    AND status = 'pending'
    AND referee_id IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', '유효하지 않은 추천 코드입니다.');
  END IF;
  
  IF referral_record.referrer_id = p_referee_id THEN
    RETURN jsonb_build_object('success', false, 'error', '자신의 추천 코드는 사용할 수 없습니다.');
  END IF;

  IF p_ip_address IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.referrals 
      WHERE ip_address = p_ip_address 
        AND DATE(created_at) = CURRENT_DATE 
        AND status IN ('completed', 'pending_verification')
        AND referee_id != p_referee_id
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', '같은 네트워크에서 오늘 이미 가입한 사용자가 있습니다.');
    END IF;
  END IF;
  
  UPDATE public.referrals
  SET 
    referee_id = p_referee_id,
    status = 'pending_verification',
    tokens_awarded = signup_bonus + referrer_signup_bonus,
    ip_address = p_ip_address,
    device_fingerprint = p_device_fingerprint,
    completed_at = now()
  WHERE id = referral_record.id;
  
  -- 추천받은 사용자에게 즉시 가입 보너스만 지급 (referral_bonus와 current_tokens만 증가, total_purchased는 증가 안함)
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens + signup_bonus,
    referral_bonus = referral_bonus + signup_bonus
  WHERE user_id = p_referee_id;
  
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
$function$;

-- process_verified_referral_rewards 함수 수정: 추천인 보상도 referral_bonus에만 기록
CREATE OR REPLACE FUNCTION public.process_verified_referral_rewards()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  processed_count INTEGER := 0;
  referral_record RECORD;
BEGIN
  FOR referral_record IN 
    SELECT * FROM public.referrals 
    WHERE status = 'pending_verification' 
      AND completed_at <= now() - INTERVAL '7 days'
  LOOP
    IF EXISTS (
      SELECT 1 FROM public.usage_tracking 
      WHERE user_id = referral_record.referee_id 
        AND created_at >= referral_record.completed_at
        AND count > 0
    ) THEN
      -- 추천인에게 보상 지급 (referral_bonus와 current_tokens만 증가, total_purchased는 증가 안함)
      UPDATE public.user_tokens
      SET 
        current_tokens = current_tokens + 3,
        referral_bonus = referral_bonus + 3
      WHERE user_id = referral_record.referrer_id;
      
      UPDATE public.referrals
      SET 
        status = 'completed',
        is_verified = true,
        verified_at = now()
      WHERE id = referral_record.id;
      
      INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
      VALUES 
        (referral_record.referrer_id, 'referral_bonus', CURRENT_DATE, 3)
      ON CONFLICT (user_id, feature_type, usage_date)
      DO UPDATE SET count = usage_tracking.count + EXCLUDED.count;
      
      processed_count := processed_count + 1;
    ELSE
      UPDATE public.referrals
      SET status = 'invalid'
      WHERE id = referral_record.id;
    END IF;
  END LOOP;
  
  RETURN processed_count;
END;
$function$;