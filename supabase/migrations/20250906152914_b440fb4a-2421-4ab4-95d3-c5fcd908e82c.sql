-- Fix Security Definer functions by ensuring they have proper search_path restrictions
-- These functions already have SET search_path TO 'public' which is correct security practice

-- Fix the functions that are missing SET search_path
CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix process_referral_reward_v2 function
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
  -- 인증된 사용자만 실행 가능
  IF auth.uid() IS NULL OR auth.uid() != p_referee_id THEN
    RETURN jsonb_build_object('success', false, 'error', '권한이 없습니다.');
  END IF;

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

  -- IP/디바이스 중복 체크 (같은 IP에서 하루에 2명 이상 가입 방지)
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
$function$;

-- Fix apply_referral_code_v2 function
CREATE OR REPLACE FUNCTION public.apply_referral_code_v2(p_referral_code text, p_user_id uuid, p_ip_address text DEFAULT NULL::text, p_device_fingerprint text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB;
BEGIN
  -- 인증된 사용자만 실행 가능
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN FALSE;
  END IF;

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
$function$;

-- Fix add_daily_tokens function
CREATE OR REPLACE FUNCTION public.add_daily_tokens()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 어제 이후 일일 보너스를 받지 않은 사용자들에게 3토큰 지급
  UPDATE public.user_tokens 
  SET 
    current_tokens = current_tokens + 3,
    total_purchased = total_purchased + 3,
    last_daily_bonus_date = CURRENT_DATE
  WHERE 
    last_daily_bonus_date < CURRENT_DATE 
    OR last_daily_bonus_date IS NULL;
  
  -- 로그 기록
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  SELECT 
    user_id, 
    'daily_bonus', 
    CURRENT_DATE, 
    3
  FROM public.user_tokens 
  WHERE last_daily_bonus_date = CURRENT_DATE
  ON CONFLICT (user_id, feature_type, usage_date) 
  DO NOTHING;
END;
$function$;

-- Fix process_referral_reward function  
CREATE OR REPLACE FUNCTION public.process_referral_reward(p_referral_code text, p_referee_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix process_verified_referral_rewards function
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
$function$;

-- Fix refresh_admin_analytics function
CREATE OR REPLACE FUNCTION public.refresh_admin_analytics()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Clear existing data
  DELETE FROM public.admin_analytics;
  
  -- Insert fresh analytics data
  INSERT INTO public.admin_analytics (
    total_users,
    total_subscribers,
    active_subscribers,
    users_with_tests,
    total_tests,
    total_revenue,
    users_with_observations,
    total_observations,
    last_updated
  )
  SELECT 
    count(DISTINCT p.user_id) AS total_users,
    count(DISTINCT s.user_id) AS total_subscribers,
    count(DISTINCT CASE WHEN s.subscribed = true THEN s.user_id ELSE NULL END) AS active_subscribers,
    count(DISTINCT tr.user_id) AS users_with_tests,
    count(tr.id) AS total_tests,
    COALESCE(sum(s.total_paid), 0) AS total_revenue,
    count(DISTINCT ol.user_id) AS users_with_observations,
    count(ol.id) AS total_observations,
    now() AS last_updated
  FROM profiles p
  LEFT JOIN subscribers s ON p.user_id = s.user_id
  LEFT JOIN test_results tr ON p.user_id = tr.user_id
  LEFT JOIN observation_logs ol ON p.user_id = ol.user_id;
$function$;