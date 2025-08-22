-- 매일 토큰 지급을 위한 크론 작업 설정

-- pg_cron 확장 활성화 (이미 활성화되어 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 기존 크론 작업이 있다면 제거
SELECT cron.unschedule('daily-token-bonus');

-- 매일 자정 UTC에 일일 토큰 지급 함수 실행
SELECT cron.schedule(
  'daily-token-bonus',
  '0 0 * * *', -- 매일 자정 UTC
  $$SELECT public.add_daily_tokens();$$
);

-- 크론 작업 확인을 위한 쿼리 (선택사항)
-- SELECT * FROM cron.job WHERE jobname = 'daily-token-bonus';