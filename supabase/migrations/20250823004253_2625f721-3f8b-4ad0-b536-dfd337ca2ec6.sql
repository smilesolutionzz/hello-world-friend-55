-- 사용자 가입 시 추천 코드 자동 처리를 위한 트리거 함수 수정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
DECLARE
  referral_code_from_signup TEXT;
BEGIN
  -- 프로필 생성
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');

  -- 토큰 초기화 (기본 10토큰)
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.id, 10, 10, CURRENT_DATE);

  -- 추천 코드가 있다면 처리 (raw_user_meta_data에서 추출)
  referral_code_from_signup := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF referral_code_from_signup IS NOT NULL AND referral_code_from_signup != '' THEN
    -- 추천 보상 처리 (5토큰 추가 지급)
    PERFORM public.process_referral_reward(referral_code_from_signup, NEW.id);
  END IF;

  RETURN NEW;
END;
$$;