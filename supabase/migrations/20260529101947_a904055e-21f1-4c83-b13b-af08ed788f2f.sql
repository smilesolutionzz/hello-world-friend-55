
-- 1) Concern threads
CREATE TABLE public.mind_track_concern_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL UNIQUE REFERENCES public.mind_track_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  audience TEXT NOT NULL DEFAULT 'parent',
  track_focus TEXT,
  concern_title TEXT NOT NULL,
  concern_detail TEXT,
  goal_statement TEXT,
  baseline_score INTEGER NOT NULL DEFAULT 5 CHECK (baseline_score BETWEEN 1 AND 10),
  current_score INTEGER NOT NULL DEFAULT 5 CHECK (current_score BETWEEN 1 AND 10),
  target_score INTEGER NOT NULL DEFAULT 8 CHECK (target_score BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  graduated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_track_concern_threads TO authenticated;
GRANT ALL ON public.mind_track_concern_threads TO service_role;
ALTER TABLE public.mind_track_concern_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own thread select" ON public.mind_track_concern_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own thread insert" ON public.mind_track_concern_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own thread update" ON public.mind_track_concern_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own thread delete" ON public.mind_track_concern_threads FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_concern_threads_user ON public.mind_track_concern_threads(user_id);
CREATE TRIGGER trg_concern_threads_updated BEFORE UPDATE ON public.mind_track_concern_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Progress snapshots
CREATE TABLE public.mind_track_progress_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.mind_track_concern_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  session_index INTEGER,
  self_score INTEGER NOT NULL CHECK (self_score BETWEEN 1 AND 10),
  mood_delta INTEGER,
  evidence_summary TEXT,
  actions_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  observations JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_track_progress_snapshots TO authenticated;
GRANT ALL ON public.mind_track_progress_snapshots TO service_role;
ALTER TABLE public.mind_track_progress_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own snap select" ON public.mind_track_progress_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own snap insert" ON public.mind_track_progress_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own snap update" ON public.mind_track_progress_snapshots FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_snap_thread_day ON public.mind_track_progress_snapshots(thread_id, day_number);

-- 3) Session reports
CREATE TABLE public.mind_track_session_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.mind_track_concern_threads(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.mind_track_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  report_html TEXT,
  report_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  key_wins JSONB NOT NULL DEFAULT '[]'::jsonb,
  risk_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_focus TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(thread_id, day_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_track_session_reports TO authenticated;
GRANT ALL ON public.mind_track_session_reports TO service_role;
ALTER TABLE public.mind_track_session_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sr select" ON public.mind_track_session_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own sr insert" ON public.mind_track_session_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sr update" ON public.mind_track_session_reports FOR UPDATE USING (auth.uid() = user_id);

-- 4) Graduation workbooks
CREATE TABLE public.mind_track_graduation_workbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL UNIQUE REFERENCES public.mind_track_concern_threads(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.mind_track_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  audience TEXT,
  track_focus TEXT,
  narrative_html TEXT,
  score_journey JSONB NOT NULL DEFAULT '[]'::jsonb,
  keepsake_quote TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_track_graduation_workbooks TO authenticated;
GRANT ALL ON public.mind_track_graduation_workbooks TO service_role;
ALTER TABLE public.mind_track_graduation_workbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own grad select" ON public.mind_track_graduation_workbooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own grad insert" ON public.mind_track_graduation_workbooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own grad update" ON public.mind_track_graduation_workbooks FOR UPDATE USING (auth.uid() = user_id);

-- 5) Storage bucket for graduation PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('graduation-workbooks', 'graduation-workbooks', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "grad pdf read own" ON storage.objects FOR SELECT
  USING (bucket_id = 'graduation-workbooks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "grad pdf insert own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'graduation-workbooks' AND auth.uid()::text = (storage.foldername(name))[1]);
