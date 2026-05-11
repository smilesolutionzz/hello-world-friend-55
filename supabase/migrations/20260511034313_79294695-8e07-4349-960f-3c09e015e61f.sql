-- Onboarding funnel events for 30-day mind track wizard
CREATE TABLE IF NOT EXISTS public.mind_track_onboarding_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage TEXT NOT NULL,
  event TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mt_onb_events_user ON public.mind_track_onboarding_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mt_onb_events_stage ON public.mind_track_onboarding_events(stage);

ALTER TABLE public.mind_track_onboarding_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own onboarding events"
  ON public.mind_track_onboarding_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own onboarding events"
  ON public.mind_track_onboarding_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);