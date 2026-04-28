-- Add multi-candidate YouTube storage and user selection for daily missions
ALTER TABLE public.mind_track_daily_missions
  ADD COLUMN IF NOT EXISTS youtube_candidates JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS selected_youtube_video_id TEXT;

-- Track journey milestone reports (Day 7/14/21/28 self-diagnosis) so we can offer one-click view/download
CREATE TABLE IF NOT EXISTS public.mind_track_milestone_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL,
  milestone_day INTEGER NOT NULL CHECK (milestone_day IN (7, 14, 21, 28, 30)),
  baseline_snapshot JSONB,
  latest_snapshot JSONB,
  checkin_summary JSONB,
  ai_narrative TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, milestone_day)
);

ALTER TABLE public.mind_track_milestone_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own milestone reports"
  ON public.mind_track_milestone_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own milestone reports"
  ON public.mind_track_milestone_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own milestone reports"
  ON public.mind_track_milestone_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mt_milestone_reports_user
  ON public.mind_track_milestone_reports (user_id, enrollment_id, milestone_day);
