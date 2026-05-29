CREATE TABLE public.mind_track_session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  step TEXT NOT NULL DEFAULT 'completed',
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  feedback TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, day_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mind_track_session_logs TO authenticated;
GRANT ALL ON public.mind_track_session_logs TO service_role;

ALTER TABLE public.mind_track_session_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_logs_owner_select" ON public.mind_track_session_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "session_logs_owner_insert" ON public.mind_track_session_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "session_logs_owner_update" ON public.mind_track_session_logs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "session_logs_owner_delete" ON public.mind_track_session_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_mind_track_session_logs_updated_at
  BEFORE UPDATE ON public.mind_track_session_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mts_logs_enroll_day ON public.mind_track_session_logs(enrollment_id, day_number);
CREATE INDEX idx_mts_logs_user ON public.mind_track_session_logs(user_id);