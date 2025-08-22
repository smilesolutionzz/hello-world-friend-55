-- 매일 토큰 지급을 위한 시스템 설정 (크론 작업 수정)

-- user_tokens 테이블에 마지막 일일 토큰 지급 날짜 추가 (이미 추가되었을 수 있음)
ALTER TABLE user_tokens 
ADD COLUMN IF NOT EXISTS last_daily_bonus_date DATE DEFAULT CURRENT_DATE;

-- 일일 토큰 지급 함수 생성/업데이트
CREATE OR REPLACE FUNCTION public.add_daily_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 어제 이후 일일 보너스를 받지 않은 사용자들에게 3토큰 지급
  UPDATE public.user_tokens 
  SET 
    current_tokens = current_tokens + 3,
    total_purchased = total_purchased + 3,
    last_daily_bonus_date = CURRENT_DATE
  WHERE 
    last_daily_bonus_date < CURRENT_DATE 
    OR last_daily_bonus_date IS NULL;
  
  -- 로그 기록
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  SELECT 
    user_id, 
    'daily_bonus', 
    CURRENT_DATE, 
    3
  FROM public.user_tokens 
  WHERE last_daily_bonus_date = CURRENT_DATE
  ON CONFLICT (user_id, feature_type, usage_date) 
  DO NOTHING;
END;
$$;

-- 신규 사용자 토큰 지급 함수 업데이트 (10토큰 + 당일 일일 보너스 설정)
CREATE OR REPLACE FUNCTION public.handle_new_user_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.user_id, 10, 10, CURRENT_DATE); -- 10 토큰 지급 + 오늘 날짜 설정
  RETURN NEW;
END;
$$;

-- pg_cron과 pg_net 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 매일 자정에 실행되는 크론 작업 생성
SELECT cron.schedule(
  'daily-token-bonus',
  '0 0 * * *', -- 매일 자정 (UTC)
  $$SELECT public.add_daily_tokens();$$
);