-- profiles 테이블에 전화번호 필드 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 전화번호 중복 방지를 위한 고유 제약 조건 추가 (NULL 값은 허용)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique 
ON public.profiles (phone) 
WHERE phone IS NOT NULL AND phone != '';

-- 기존 handle_new_user 함수 업데이트
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referral_code_from_signup TEXT;
BEGIN
  -- 프로필 생성 (전화번호와 생년월일 포함)
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
  );

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