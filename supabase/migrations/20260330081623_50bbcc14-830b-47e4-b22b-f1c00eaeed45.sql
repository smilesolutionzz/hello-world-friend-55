-- 변화추적용 통합 결과 테이블
CREATE TABLE public.progress_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_type text NOT NULL,
  source_id text,
  source_label text,
  dimension_scores jsonb NOT NULL DEFAULT '{}',
  summary text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_progress_tracking_user ON public.progress_tracking(user_id, source_type, created_at DESC);

ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.progress_tracking
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.progress_tracking
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);