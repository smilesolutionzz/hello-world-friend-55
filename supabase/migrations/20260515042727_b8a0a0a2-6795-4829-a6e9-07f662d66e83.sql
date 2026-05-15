-- 7일 마음 트랙 결제자에게 매일 오전 8시 KST(=UTC 23:00) Day N 미션 이메일 발송
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
DECLARE
  jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'mind-track-mission-email-8am-kst';
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;
END $$;

SELECT cron.schedule(
  'mind-track-mission-email-8am-kst',
  '0 23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/mind-track-mission-email-cron',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY3F4amV0bXp4b2VwaGd5amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjUzNDAsImV4cCI6MjA3MTI0MTM0MH0.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg"}'::jsonb,
    body := jsonb_build_object('triggered_at', now())
  ) AS request_id;
  $$
);