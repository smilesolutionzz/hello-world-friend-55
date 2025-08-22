-- 보안 이슈 해결: 함수들의 search_path 설정

-- 기존 함수들의 search_path 설정 업데이트
CREATE OR REPLACE FUNCTION public.add_daily_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 기존 track_feature_usage 함수 search_path 설정
CREATE OR REPLACE FUNCTION public.track_feature_usage(p_user_id uuid, p_feature_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (p_user_id, p_feature_type, CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + 1;
END;
$$;

-- 기존 get_monthly_usage 함수 search_path 설정
CREATE OR REPLACE FUNCTION public.get_monthly_usage(p_user_id uuid, p_feature_type text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 기존 update_updated_at_column 함수 search_path 설정
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;