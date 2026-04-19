-- 30일 마음 변화 트랙 등록/진행 테이블
CREATE TABLE public.mind_track_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_type TEXT NOT NULL DEFAULT 'mind_30day',
  goal_focus TEXT,
  baseline_data JSONB DEFAULT '{}'::jsonb,
  daily_progress JSONB DEFAULT '[]'::jsonb,
  current_day INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_amount INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mind_track_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own track" ON public.mind_track_enrollments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own track" ON public.mind_track_enrollments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own track" ON public.mind_track_enrollments
FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_mind_track_updated_at
BEFORE UPDATE ON public.mind_track_enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mind_track_user ON public.mind_track_enrollments(user_id, status);