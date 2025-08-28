-- 관리자용 토큰 지급 함수 생성
CREATE OR REPLACE FUNCTION public.admin_add_tokens(target_user_id uuid, token_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- 토큰 추가
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens + token_amount,
    total_purchased = total_purchased + token_amount
  WHERE user_id = target_user_id;
  
  -- 사용량 추적 기록
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (target_user_id, 'admin_bonus', CURRENT_DATE, token_amount)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + token_amount;
  
  RETURN TRUE;
END;
$$;