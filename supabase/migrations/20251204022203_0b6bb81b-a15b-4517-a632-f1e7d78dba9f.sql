-- 이메일 중복 체크 함수 (비로그인도 호출 가능)
CREATE OR REPLACE FUNCTION public.check_email_availability(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_exists BOOLEAN;
BEGIN
  -- 빈 이메일이면 사용 가능으로 반환
  IF COALESCE(check_email, '') = '' THEN
    RETURN TRUE;
  END IF;
  
  -- 이메일 존재 여부 확인 (대소문자 무시)
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE LOWER(email) = LOWER(check_email)
  ) INTO email_exists;
  
  -- 존재하면 FALSE (사용 불가), 없으면 TRUE (사용 가능)
  RETURN NOT email_exists;
END;
$$;

-- 익명 사용자도 호출 가능하도록 권한 부여
GRANT EXECUTE ON FUNCTION public.check_email_availability(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_availability(TEXT) TO authenticated;