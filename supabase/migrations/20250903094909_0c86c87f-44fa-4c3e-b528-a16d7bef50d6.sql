-- 전화번호와 이메일 중복 체크를 위한 함수 수정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  referral_code_from_signup TEXT;
  existing_phone_user_id UUID;
  existing_email_user_id UUID;
  signup_phone TEXT;
  signup_email TEXT;
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

  -- Insert tokens with 15 tokens for new users
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.id, 15, 15, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE LOG 'User tokens inserted for user: % (15 tokens)', NEW.id;

  -- Handle referral code if provided
  referral_code_from_signup := NEW.raw_user_meta_data ->> 'referral_code';
  RAISE LOG 'Referral code from signup: %', referral_code_from_signup;
  
  IF referral_code_from_signup IS NOT NULL AND referral_code_from_signup != '' THEN
    -- Process referral reward (5 additional tokens)
    RAISE LOG 'Processing referral reward for code: %', referral_code_from_signup;
    PERFORM public.process_referral_reward(referral_code_from_signup, NEW.id);
    RAISE LOG 'Referral reward processed';
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

-- 전화번호 중복 체크를 위한 함수 생성
CREATE OR REPLACE FUNCTION public.check_phone_availability(phone_number text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 전화번호가 null이거나 빈 문자열이면 사용 가능
  IF phone_number IS NULL OR phone_number = '' THEN
    RETURN true;
  END IF;
  
  -- 기존 사용자 중에 같은 전화번호가 있는지 확인
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone = phone_number
  );
END;
$$;