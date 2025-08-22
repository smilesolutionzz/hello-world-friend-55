-- 보안 문제 해결: search_path 설정 추가

-- 일일 토큰 지급 함수 보안 강화
CREATE OR REPLACE FUNCTION public.add_daily_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 기존 함수들도 search_path 보안 강화
CREATE OR REPLACE FUNCTION public.handle_new_user_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.user_id, 10, 10, CURRENT_DATE);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 무료 플랜 ID 가져오기
  INSERT INTO public.user_subscriptions (user_id, subscription_type, plan_id)
  SELECT NEW.user_id, 'free', id 
  FROM subscription_plans 
  WHERE type = 'free' 
  LIMIT 1;
  RETURN NEW;
END;
$$;