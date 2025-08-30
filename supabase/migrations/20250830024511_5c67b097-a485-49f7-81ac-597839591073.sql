-- 회원가입 시 15토큰 지급으로 변경하고 전화번호 중복 처리 개선
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referral_code_from_signup TEXT;
  existing_phone_user_id UUID;
BEGIN
  -- 디버깅 로그
  RAISE LOG 'handle_new_user called for user: %', NEW.id;
  RAISE LOG 'user metadata: %', NEW.raw_user_meta_data;

  -- 전화번호 중복 체크 (전화번호가 있는 경우에만)
  IF NEW.raw_user_meta_data ->> 'phone' IS NOT NULL AND NEW.raw_user_meta_data ->> 'phone' != '' THEN
    SELECT user_id INTO existing_phone_user_id 
    FROM public.profiles 
    WHERE phone = NEW.raw_user_meta_data ->> 'phone' 
    AND user_id != NEW.id;
    
    IF existing_phone_user_id IS NOT NULL THEN
      RAISE WARNING 'Phone number already exists for user: %', existing_phone_user_id;
      -- 전화번호가 중복인 경우 null로 설정하여 처리
    END IF;
  END IF;

  -- Insert profile with proper error handling
  INSERT INTO public.profiles (user_id, display_name, phone, birth_date)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    CASE 
      WHEN existing_phone_user_id IS NOT NULL THEN NULL
      ELSE NULLIF(NEW.raw_user_meta_data ->> 'phone', '')
    END,
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
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 전화번호 중복 방지를 위한 unique constraint 확인 및 생성
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique 
ON public.profiles (phone) 
WHERE phone IS NOT NULL AND phone != '';

-- 기존 사용자들의 토큰도 15로 보정 (현재 토큰이 10 이하인 경우)
UPDATE public.user_tokens 
SET 
  current_tokens = current_tokens + (15 - LEAST(current_tokens, 10)),
  total_purchased = total_purchased + (15 - LEAST(total_purchased, 10))
WHERE current_tokens <= 10 AND total_purchased <= 10;