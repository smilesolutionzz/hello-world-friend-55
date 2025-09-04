-- 가입 시 추천 처리 함수 업데이트
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_code_from_signup TEXT;
  existing_phone_user_id UUID;
  existing_email_user_id UUID;
  signup_phone TEXT;
  signup_email TEXT;
  signup_bonus INTEGER := 15;  -- 기본 가입 보너스
  result JSONB;
BEGIN
  -- 디버깅 로그
  RAISE LOG 'handle_new_user called for user: %', NEW.id;
  RAISE LOG 'user metadata: %', NEW.raw_user_meta_data;

  -- 가입 정보 추출
  signup_phone := NEW.raw_user_meta_data ->> 'phone';
  signup_email := NEW.email;

  -- 이메일 중복 체크 (추가 보안)
  IF signup_email IS NOT NULL AND signup_email != '' THEN
    SELECT id INTO existing_email_user_id 
    FROM auth.users 
    WHERE email = signup_email 
    AND id != NEW.id;
    
    IF existing_email_user_id IS NOT NULL THEN
      RAISE EXCEPTION 'EMAIL_ALREADY_EXISTS: 이미 사용 중인 이메일 주소입니다.';
    END IF;
  END IF;

  -- 전화번호 중복 체크 (전화번호가 있는 경우에만)
  IF signup_phone IS NOT NULL AND signup_phone != '' THEN
    SELECT user_id INTO existing_phone_user_id 
    FROM public.profiles 
    WHERE phone = signup_phone 
    AND user_id != NEW.id;
    
    IF existing_phone_user_id IS NOT NULL THEN
      RAISE EXCEPTION 'PHONE_ALREADY_EXISTS: 이미 사용 중인 전화번호입니다.';
    END IF;
  END IF;

  -- Insert profile with proper error handling
  INSERT INTO public.profiles (user_id, display_name, phone, birth_date)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NULLIF(signup_phone, ''),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'birth_date' != '' 
      THEN (NEW.raw_user_meta_data ->> 'birth_date')::DATE
      ELSE NULL 
    END
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert tokens with basic signup bonus
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.id, signup_bonus, signup_bonus, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE LOG 'User tokens inserted for user: % (% tokens)', NEW.id, signup_bonus;

  -- Handle referral code if provided (새로운 시스템 사용)
  referral_code_from_signup := NEW.raw_user_meta_data ->> 'referral_code';
  RAISE LOG 'Referral code from signup: %', referral_code_from_signup;
  
  IF referral_code_from_signup IS NOT NULL AND referral_code_from_signup != '' THEN
    RAISE LOG 'Processing referral reward for code: %', referral_code_from_signup;
    
    -- 새로운 추천 보상 시스템 사용
    SELECT public.process_referral_reward_v2(
      referral_code_from_signup, 
      NEW.id, 
      '127.0.0.1', -- 실제로는 가입 시 IP를 전달받아야 함
      NULL
    ) INTO result;
    
    RAISE LOG 'Referral reward result: %', result;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 특정 에러는 다시 발생시켜 가입을 차단
    IF SQLERRM LIKE 'EMAIL_ALREADY_EXISTS:%' OR SQLERRM LIKE 'PHONE_ALREADY_EXISTS:%' THEN
      RAISE;
    ELSE
      -- 다른 에러는 로그만 남기고 가입은 허용
      RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
      RETURN NEW;
    END IF;
END;
$$;