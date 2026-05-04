-- 매시간 정각에 후속 디스패처 호출
SELECT cron.schedule(
  'b2b-followup-dispatcher-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/b2b-followup-dispatcher',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY3F4amV0bXp4b2VwaGd5amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjUzNDAsImV4cCI6MjA3MTI0MTM0MH0.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);