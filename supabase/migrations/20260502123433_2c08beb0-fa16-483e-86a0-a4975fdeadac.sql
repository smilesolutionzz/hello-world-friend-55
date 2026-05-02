CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove prior schedule if it exists (idempotent)
DO $$
DECLARE
  jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'validate-mindtrack-videos-daily';
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;
END $$;

SELECT cron.schedule(
  'validate-mindtrack-videos-daily',
  '0 18 * * *', -- 18:00 UTC = 03:00 KST
  $$
  SELECT net.http_post(
    url := 'https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/validate-mindtrack-videos',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY3F4amV0bXp4b2VwaGd5amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjUzNDAsImV4cCI6MjA3MTI0MTM0MH0.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg"}'::jsonb,
    body := jsonb_build_object('source','cron','ts', now())
  );
  $$
);