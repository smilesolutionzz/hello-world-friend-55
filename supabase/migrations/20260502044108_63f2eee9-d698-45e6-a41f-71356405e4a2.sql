-- 1. Video Events Log
CREATE TABLE public.mind_track_video_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  video_title TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('click','start','complete','thumbnail_click')),
  day_number INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtve_user ON public.mind_track_video_events(user_id, created_at DESC);
CREATE INDEX idx_mtve_video ON public.mind_track_video_events(video_id);

ALTER TABLE public.mind_track_video_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own video events"
ON public.mind_track_video_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own video events"
ON public.mind_track_video_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- 2. Daily Content Overrides
CREATE TABLE public.mind_track_daily_content_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL UNIQUE CHECK (day_number BETWEEN 1 AND 30),
  assessment JSONB,
  video JSONB,
  action JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mtdco_day ON public.mind_track_daily_content_overrides(day_number) WHERE is_active = true;

ALTER TABLE public.mind_track_daily_content_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active overrides"
ON public.mind_track_daily_content_overrides FOR SELECT
TO authenticated
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage overrides"
ON public.mind_track_daily_content_overrides FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER mtdco_updated_at
BEFORE UPDATE ON public.mind_track_daily_content_overrides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();