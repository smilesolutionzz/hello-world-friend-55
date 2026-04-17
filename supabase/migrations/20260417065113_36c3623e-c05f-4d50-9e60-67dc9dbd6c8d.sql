-- STEP 7: Weekly Coaching Digest cron 스케줄 등록
-- 매주 화요일 오전 9시 (KST 기준 = UTC 0시)에 발송

-- pg_cron, pg_net 확장 활성화 (이미 있으면 무시)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 기존 동일 스케줄이 있으면 제거 (재등록 안전성)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-coaching-digest-tuesday-9am') THEN
    PERFORM cron.unschedule('weekly-coaching-digest-tuesday-9am');
  END IF;
END $$;

-- 매주 화요일 00:00 UTC (KST 화요일 09:00) 실행
SELECT cron.schedule(
  'weekly-coaching-digest-tuesday-9am',
  '0 0 * * 2',
  $$
  SELECT net.http_post(
    url := 'https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/send-weekly-coaching-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY3F4amV0bXp4b2VwaGd5amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjUzNDAsImV4cCI6MjA3MTI0MTM0MH0.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg"}'::jsonb,
    body := concat('{"trigger": "cron", "time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);