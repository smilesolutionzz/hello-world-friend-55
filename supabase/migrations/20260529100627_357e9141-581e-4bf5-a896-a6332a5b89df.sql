-- Action prescription cache: expert-grade daily solution cards per enrollment×day
CREATE TABLE public.mind_track_action_prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.mind_track_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INT NOT NULL,
  track_focus TEXT,
  audience TEXT NOT NULL DEFAULT 'parent',
  framework TEXT,
  summary TEXT,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rationale JSONB NOT NULL DEFAULT '{}'::jsonb,
  observation_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_picks JSONB NOT NULL DEFAULT '[]'::jsonb,
  product_picks JSONB NOT NULL DEFAULT '[]'::jsonb,
  email_status TEXT NOT NULL DEFAULT 'pending',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, day_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_track_action_prescriptions TO authenticated;
GRANT ALL ON public.mind_track_action_prescriptions TO service_role;

ALTER TABLE public.mind_track_action_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own prescriptions"
ON public.mind_track_action_prescriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own prescriptions"
ON public.mind_track_action_prescriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own prescriptions"
ON public.mind_track_action_prescriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_action_prescriptions_enrollment_day
  ON public.mind_track_action_prescriptions (enrollment_id, day_number);
CREATE INDEX idx_action_prescriptions_email_status
  ON public.mind_track_action_prescriptions (email_status, generated_at);

CREATE TRIGGER update_action_prescriptions_updated_at
BEFORE UPDATE ON public.mind_track_action_prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();