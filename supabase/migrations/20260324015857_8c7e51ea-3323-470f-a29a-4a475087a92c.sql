-- 신규 가입 시 15토큰 대신 검사 쿠폰 2개 지급으로 변경
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referral_code_from_signup TEXT;
  existing_phone_user_id UUID;
  existing_email_user_id UUID;
  signup_phone TEXT;
  signup_email TEXT;
  result JSONB;
BEGIN
  RAISE LOG 'handle_new_user called for user: %', NEW.id;

  signup_phone := NEW.raw_user_meta_data ->> 'phone';
  signup_email := NEW.email;

  IF signup_email IS NOT NULL AND signup_email != '' THEN
    SELECT id INTO existing_email_user_id 
    FROM auth.users 
    WHERE email = signup_email 
    AND id != NEW.id;
    
    IF existing_email_user_id IS NOT NULL THEN
      RAISE EXCEPTION 'EMAIL_ALREADY_EXISTS: 이미 사용 중인 이메일 주소입니다.';
    END IF;
  END IF;

  IF signup_phone IS NOT NULL AND signup_phone != '' THEN
    SELECT user_id INTO existing_phone_user_id 
    FROM public.profiles 
    WHERE phone = signup_phone 
    AND user_id != NEW.id;
    
    IF existing_phone_user_id IS NOT NULL THEN
      RAISE EXCEPTION 'PHONE_ALREADY_EXISTS: 이미 사용 중인 전화번호입니다.';
    END IF;
  END IF;

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

  -- 토큰 레코드는 0으로 생성 (토큰 보너스 없음)
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.id, 0, 0, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  -- 가입 보너스: 검사 이용권 2개 지급
  INSERT INTO public.user_test_credits (user_id, credits, source)
  VALUES (NEW.id, 2, 'signup_bonus');

  RAISE LOG 'User test credits (2) granted for user: %', NEW.id;

  referral_code_from_signup := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF referral_code_from_signup IS NOT NULL AND referral_code_from_signup != '' THEN
    SELECT public.process_referral_reward_v2(
      referral_code_from_signup, 
      NEW.id, 
      '127.0.0.1',
      NULL
    ) INTO result;
    
    RAISE LOG 'Referral reward result: %', result;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE 'EMAIL_ALREADY_EXISTS:%' OR SQLERRM LIKE 'PHONE_ALREADY_EXISTS:%' THEN
      RAISE;
    ELSE
      RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
      RETURN NEW;
    END IF;
END;
$$;