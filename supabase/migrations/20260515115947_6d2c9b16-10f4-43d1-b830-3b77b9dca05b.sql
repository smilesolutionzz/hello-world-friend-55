-- 마일스톤 안내 메일 중복 발송 방지
CREATE TABLE IF NOT EXISTS public.mind_track_milestone_emails_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.mind_track_enrollments(id) ON DELETE CASCADE,
  milestone_day integer NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, milestone_day, channel)
);

ALTER TABLE public.mind_track_milestone_emails_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can read own milestone email log"
ON public.mind_track_milestone_emails_sent
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mind_track_enrollments e
    WHERE e.id = mind_track_milestone_emails_sent.enrollment_id
      AND e.user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_mt_milestone_emails_enrollment
  ON public.mind_track_milestone_emails_sent(enrollment_id, milestone_day);

-- pg_cron 스케줄: 매일 한국시간 09:00 (UTC 00:00)
SELECT cron.schedule(
  'mind-track-milestone-cron-daily',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/mind-track-milestone-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY3F4amV0bXp4b2VwaGd5amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjUzNDAsImV4cCI6MjA3MTI0MTM0MH0.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg'
    ),
    body := jsonb_build_object('triggered_at', now())
  );
  $$
);