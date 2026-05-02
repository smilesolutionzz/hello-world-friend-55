-- 1) History
CREATE TABLE public.mind_track_daily_content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 30),
  assessment JSONB,
  video JSONB,
  action JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  change_type TEXT NOT NULL CHECK (change_type IN ('save','delete','restore')),
  changed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtdch_day ON public.mind_track_daily_content_history(day_number, created_at DESC);

ALTER TABLE public.mind_track_daily_content_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage history"
ON public.mind_track_daily_content_history FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2) Aggregated stats view (RLS via underlying table)
CREATE OR REPLACE VIEW public.mind_track_video_event_stats
WITH (security_invoker = true)
AS
SELECT
  video_id,
  COALESCE(video_title, '') AS video_title,
  day_number,
  COUNT(*) FILTER (WHERE event_type IN ('click','thumbnail_click')) AS click_count,
  COUNT(*) FILTER (WHERE event_type = 'start')    AS start_count,
  COUNT(*) FILTER (WHERE event_type = 'complete') AS complete_count,
  COUNT(DISTINCT user_id) AS unique_users,
  MAX(created_at) AS last_event_at
FROM public.mind_track_video_events
GROUP BY video_id, COALESCE(video_title,''), day_number;