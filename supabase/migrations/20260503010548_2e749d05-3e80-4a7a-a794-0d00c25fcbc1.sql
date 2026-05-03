
CREATE TABLE public.mind_track_video_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  youtube_url TEXT NOT NULL,
  video_id TEXT,
  suggested_for_day INT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mind_track_video_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users insert their own suggestions"
ON public.mind_track_video_suggestions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users view their own suggestions"
ON public.mind_track_video_suggestions FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update suggestions"
ON public.mind_track_video_suggestions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_mind_track_video_suggestions_updated_at
BEFORE UPDATE ON public.mind_track_video_suggestions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mind_track_video_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day INT NOT NULL,
  video_id TEXT NOT NULL,
  reason_type TEXT NOT NULL DEFAULT 'mismatch',
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mind_track_video_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users insert their own feedback"
ON public.mind_track_video_feedback FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users view their own feedback"
ON public.mind_track_video_feedback FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_mtv_feedback_day_video ON public.mind_track_video_feedback(day, video_id);
CREATE INDEX idx_mtv_suggestions_status ON public.mind_track_video_suggestions(status, created_at DESC);
