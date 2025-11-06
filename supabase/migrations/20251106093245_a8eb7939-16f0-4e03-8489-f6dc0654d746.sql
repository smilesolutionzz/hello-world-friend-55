-- admin_add_tokens 함수 수정: 관리자 보너스는 total_purchased에 포함하지 않음
CREATE OR REPLACE FUNCTION public.admin_add_tokens(target_user_id uuid, token_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- 토큰 추가 (관리자 보너스는 total_purchased가 아닌 current_tokens만 증가)
  UPDATE public.user_tokens
  SET current_tokens = current_tokens + token_amount
  WHERE user_id = target_user_id;
  
  -- 사용량 추적 기록
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (target_user_id, 'admin_bonus', CURRENT_DATE, token_amount)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + token_amount;
  
  RETURN TRUE;
END;
$function$;

-- add_daily_tokens 함수 수정: 일일 보너스는 total_purchased에 포함하지 않음
CREATE OR REPLACE FUNCTION public.add_daily_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- 어제 이후 일일 보너스를 받지 않은 사용자들에게 3토큰 지급 (total_purchased는 증가시키지 않음)
  UPDATE public.user_tokens 
  SET 
    current_tokens = current_tokens + 3,
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