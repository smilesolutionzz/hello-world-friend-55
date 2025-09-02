-- 모든 남은 보안 문제들을 해결

-- 1. 남은 함수들의 search_path 보안 강화
CREATE OR REPLACE FUNCTION public.refresh_admin_analytics()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.process_referral_reward(p_referral_code text, p_referee_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.apply_referral_code(p_referral_code text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.track_feature_usage(p_user_id uuid, p_feature_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (p_user_id, p_feature_type, CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_usage(p_user_id uuid, p_feature_type text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(count), 0)
  INTO usage_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND usage_date >= DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN usage_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_daily_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;