
CREATE TABLE IF NOT EXISTS public.aba_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  enrollment_id uuid,
  child_profile_id uuid,
  day int NOT NULL CHECK (day BETWEEN 1 AND 7),
  phase text NOT NULL,
  target_behavior text,
  data_method text NOT NULL CHECK (data_method IN ('frequency','duration','interval','abc_narrative')),
  frequency_count int,
  duration_seconds int,
  interval_hits int,
  interval_total int,
  abc_antecedent text,
  abc_behavior text,
  abc_consequence text,
  reinforcer_used text,
  parent_script_used boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS aba_observations_unique_day
  ON public.aba_observations (user_id, day, COALESCE(child_profile_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS aba_observations_user_idx ON public.aba_observations(user_id);
CREATE INDEX IF NOT EXISTS aba_observations_enrollment_idx ON public.aba_observations(enrollment_id);

ALTER TABLE public.aba_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aba_obs select own" ON public.aba_observations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "aba_obs insert own" ON public.aba_observations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "aba_obs update own" ON public.aba_observations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "aba_obs delete own" ON public.aba_observations
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_aba_observations_updated_at
  BEFORE UPDATE ON public.aba_observations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
