-- 닉네임(display_name) 중복 체크 RPC 함수 생성
CREATE OR REPLACE FUNCTION public.check_nickname_availability(nickname text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 닉네임이 비어있으면 사용 가능으로 처리
  IF nickname IS NULL OR trim(nickname) = '' THEN
    RETURN true;
  END IF;
  
  -- 닉네임 중복 체크 (대소문자 구분 없이)
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE lower(trim(display_name)) = lower(trim(nickname))
  );
END;
$$;