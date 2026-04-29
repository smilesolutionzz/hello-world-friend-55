ALTER TABLE public.mind_track_daily_missions
  ADD COLUMN IF NOT EXISTS watched_video_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.mind_track_checkins
  ADD COLUMN IF NOT EXISTS video_reflection text;