-- 30일 마음 트랙 최종 워크북 저장 테이블
CREATE TABLE IF NOT EXISTS public.mind_track_final_workbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.mind_track_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  compiled_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_insights TEXT,
  chart_data JSONB DEFAULT '{}'::jsonb,
  completion_certificate JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mt_final_workbook_enrollment
  ON public.mind_track_final_workbooks (enrollment_id);

CREATE INDEX IF NOT EXISTS idx_mt_final_workbook_user
  ON public.mind_track_final_workbooks (user_id);

ALTER TABLE public.mind_track_final_workbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own final workbook"
  ON public.mind_track_final_workbooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own final workbook"
  ON public.mind_track_final_workbooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own final workbook"
  ON public.mind_track_final_workbooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all final workbooks"
  ON public.mind_track_final_workbooks FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_mt_final_workbooks_updated_at
  BEFORE UPDATE ON public.mind_track_final_workbooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();