ALTER TABLE public.mind_track_daily_missions
  ADD COLUMN IF NOT EXISTS youtube_query text,
  ADD COLUMN IF NOT EXISTS youtube_video_id text,
  ADD COLUMN IF NOT EXISTS youtube_title text,
  ADD COLUMN IF NOT EXISTS youtube_thumbnail text;