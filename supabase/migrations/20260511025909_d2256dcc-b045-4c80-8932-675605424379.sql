
-- Track per-child mission progress on the server (started / in_progress / completed)
CREATE TYPE public.child_mission_status AS ENUM ('started', 'in_progress', 'completed');

CREATE TABLE public.mind_track_child_mission_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id UUID NOT NULL REFERENCES public.user_child_profiles(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 30),
  status public.child_mission_status NOT NULL DEFAULT 'started',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_profile_id, day)
);

CREATE INDEX idx_mtcms_user ON public.mind_track_child_mission_status(user_id);
CREATE INDEX idx_mtcms_profile ON public.mind_track_child_mission_status(child_profile_id);

ALTER TABLE public.mind_track_child_mission_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own select" ON public.mind_track_child_mission_status
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.mind_track_child_mission_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.mind_track_child_mission_status
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.mind_track_child_mission_status
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_mtcms_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_mtcms_touch
BEFORE UPDATE ON public.mind_track_child_mission_status
FOR EACH ROW EXECUTE FUNCTION public.touch_mtcms_updated_at();
