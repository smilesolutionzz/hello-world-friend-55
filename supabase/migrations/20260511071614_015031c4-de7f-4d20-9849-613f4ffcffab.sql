-- 미완료 Day 리마인더 발송 이력 (중복 발송 방지)
CREATE TABLE IF NOT EXISTS public.mind_track_reminders_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, day_number, channel)
);

ALTER TABLE public.mind_track_reminders_sent ENABLE ROW LEVEL SECURITY;

-- 본인만 자신의 발송 이력 조회 가능
CREATE POLICY "users_view_own_reminders"
ON public.mind_track_reminders_sent
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 서비스 롤만 INSERT (cron이 service role로 실행)
CREATE POLICY "service_role_insert_reminders"
ON public.mind_track_reminders_sent
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_mind_track_reminders_enrollment_day
  ON public.mind_track_reminders_sent (enrollment_id, day_number);

-- pg_cron 스케줄: 매일 오후 8시(KST = UTC 11) 미완료 Day 리마인더 cron 호출
-- 주의: pg_cron / pg_net 확장이 활성화되어 있어야 함
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
     AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM cron.unschedule('mind-track-reminder-cron-daily')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'mind-track-reminder-cron-daily');

    PERFORM cron.schedule(
      'mind-track-reminder-cron-daily',
      '0 11 * * *',
      $cron$
      SELECT net.http_post(
        url := 'https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/mind-track-reminder-cron',
        headers := '{"Content-Type":"application/json"}'::jsonb,
        body := '{}'::jsonb
      );
      $cron$
    );
  END IF;
END $$;