CREATE TABLE public.mind_track_day_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  focus_goal TEXT NOT NULL,
  day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 30),
  category TEXT NOT NULL DEFAULT 'mindfulness',
  mission_title TEXT NOT NULL,
  mission_description TEXT,
  mission_duration_minutes INT NOT NULL DEFAULT 5,
  reason TEXT,
  video_id TEXT,
  video_title TEXT,
  video_platform TEXT NOT NULL DEFAULT 'youtube',
  video_url TEXT,
  video_available BOOLEAN NOT NULL DEFAULT true,
  last_validated_at TIMESTAMPTZ,
  validation_notes TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (focus_goal, day_number)
);

CREATE INDEX idx_mind_track_day_content_focus ON public.mind_track_day_content(focus_goal, day_number);
CREATE INDEX idx_mind_track_day_content_validation ON public.mind_track_day_content(video_available, last_validated_at);

ALTER TABLE public.mind_track_day_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mind track content"
ON public.mind_track_day_content FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert mind track content"
ON public.mind_track_day_content FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update mind track content"
ON public.mind_track_day_content FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete mind track content"
ON public.mind_track_day_content FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_mind_track_day_content_updated_at
BEFORE UPDATE ON public.mind_track_day_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();