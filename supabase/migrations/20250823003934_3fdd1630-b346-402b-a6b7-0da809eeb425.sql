-- search_path를 설정하지 않은 함수들의 보안 수정
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- 6자리 랜덤 코드 생성 (영문 대문자 + 숫자)
    code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));
    
    -- 중복 체크
    SELECT COUNT(*) INTO exists_check 
    FROM public.referrals 
    WHERE referral_code = code;
    
    -- 중복이 없으면 루프 종료
    IF exists_check = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;