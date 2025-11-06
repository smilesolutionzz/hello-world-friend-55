-- handle_new_user 함수 수정: 가입 보너스는 total_purchased가 아닌 current_tokens만 증가
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referral_code_from_signup TEXT;
  existing_phone_user_id UUID;
  existing_email_user_id UUID;
  signup_phone TEXT;
  signup_email TEXT;
  signup_bonus INTEGER := 15;  -- 기본 가입 보너스
  result JSONB;
BEGIN
  RAISE LOG 'handle_new_user called for user: %', NEW.id;
  RAISE LOG 'user metadata: %', NEW.raw_user_meta_data;

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

  -- 가입 보너스는 total_purchased가 아닌 current_tokens만 증가
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.id, signup_bonus, 0, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE LOG 'User tokens inserted for user: % (% tokens)', NEW.id, signup_bonus;

  referral_code_from_signup := NEW.raw_user_meta_data ->> 'referral_code';
  RAISE LOG 'Referral code from signup: %', referral_code_from_signup;
  
  IF referral_code_from_signup IS NOT NULL AND referral_code_from_signup != '' THEN
    RAISE LOG 'Processing referral reward for code: %', referral_code_from_signup;
    
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
$function$;