-- 전화번호 중복 체크 함수 (비로그인도 호출 가능)
CREATE OR REPLACE FUNCTION public.check_phone_availability(phone_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_phone TEXT;
  phone_exists BOOLEAN;
BEGIN
  -- 하이픈 제거
  clean_phone := REPLACE(COALESCE(phone_number, ''), '-', '');
  
  -- 빈 전화번호면 사용 가능으로 반환
  IF clean_phone = '' OR LENGTH(clean_phone) < 10 THEN
    RETURN TRUE;
  END IF;
  
  -- 전화번호 존재 여부 확인
  SELECT EXISTS(
    SELECT 1 FROM profiles 
    WHERE phone = clean_phone OR phone = phone_number
  ) INTO phone_exists;
  
  -- 존재하면 FALSE (사용 불가), 없으면 TRUE (사용 가능)
  RETURN NOT phone_exists;
END;
$$;

-- 익명 사용자도 호출 가능하도록 권한 부여
GRANT EXECUTE ON FUNCTION public.check_phone_availability(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_phone_availability(TEXT) TO authenticated;