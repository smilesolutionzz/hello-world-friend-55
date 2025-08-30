-- 새로 가입한 사용자에게 기본 토큰 지급 확인 및 수정
INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
VALUES ('7d8daaaa-37af-40aa-ab23-d7759e4172b0', 10, 10, CURRENT_DATE)
ON CONFLICT (user_id) DO UPDATE SET
  current_tokens = GREATEST(EXCLUDED.current_tokens, user_tokens.current_tokens),
  total_purchased = GREATEST(EXCLUDED.total_purchased, user_tokens.total_purchased);

-- 디버깅을 위해 handle_new_user 함수 수정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referral_code_from_signup TEXT;
BEGIN
  -- 디버깅 로그
  RAISE LOG 'handle_new_user called for user: %', NEW.id;
  RAISE LOG 'user metadata: %', NEW.raw_user_meta_data;

  -- Insert profile with proper error handling
  INSERT INTO public.profiles (user_id, display_name, phone, birth_date)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'birth_date' != '' 
      THEN (NEW.raw_user_meta_data ->> 'birth_date')::DATE
      ELSE NULL 
    END
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert tokens with conflict handling  
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.id, 10, 10, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE LOG 'User tokens inserted for user: %', NEW.id;

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