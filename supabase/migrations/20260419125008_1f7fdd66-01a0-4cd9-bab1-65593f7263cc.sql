CREATE TABLE IF NOT EXISTS public.mind_track_baseline_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES public.mind_track_enrollments(id) ON DELETE CASCADE,
  assessment_mode TEXT NOT NULL DEFAULT 'quick',
  measurement_point TEXT NOT NULL DEFAULT 'baseline',
  stress_score INTEGER,
  energy_score INTEGER,
  clarity_score INTEGER,
  mood_label TEXT,
  primary_concern TEXT,
  raw_responses JSONB,
  ai_interpretation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_baseline_user ON public.mind_track_baseline_assessments(user_id, enrollment_id, measurement_point);

ALTER TABLE public.mind_track_baseline_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own baselines" ON public.mind_track_baseline_assessments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own baselines" ON public.mind_track_baseline_assessments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.mind_track_workbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES public.mind_track_enrollments(id) ON DELETE CASCADE,
  initial_summary TEXT,
  root_causes JSONB,
  strength_areas JSONB,
  challenge_theme TEXT,
  weekly_themes JSONB,
  expected_outcomes JSONB,
  generated_by_ai BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id)
);

ALTER TABLE public.mind_track_workbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own workbooks" ON public.mind_track_workbooks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own workbooks" ON public.mind_track_workbooks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own workbooks" ON public.mind_track_workbooks
FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.mind_track_daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES public.mind_track_enrollments(id) ON DELETE CASCADE,
  workbook_id UUID NOT NULL REFERENCES public.mind_track_workbooks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 30),
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 5),
  mission_title TEXT NOT NULL,
  mission_description TEXT,
  mission_type TEXT,
  estimated_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id, day_number)
);

CREATE INDEX idx_missions_enrollment ON public.mind_track_daily_missions(enrollment_id, day_number);

ALTER TABLE public.mind_track_daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own missions" ON public.mind_track_daily_missions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own missions" ON public.mind_track_daily_missions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.mind_track_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES public.mind_track_enrollments(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.mind_track_daily_missions(id) ON DELETE SET NULL,
  day_number INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  mood_score INTEGER CHECK (mood_score BETWEEN 0 AND 10),
  energy_score INTEGER CHECK (energy_score BETWEEN 0 AND 10),
  clarity_score INTEGER CHECK (clarity_score BETWEEN 0 AND 10),
  reflection_note TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id, day_number)
);

CREATE INDEX idx_checkins_enrollment ON public.mind_track_checkins(enrollment_id, day_number);

ALTER TABLE public.mind_track_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own checkins" ON public.mind_track_checkins
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own checkins" ON public.mind_track_checkins
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own checkins" ON public.mind_track_checkins
FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_workbooks_updated_at
BEFORE UPDATE ON public.mind_track_workbooks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();