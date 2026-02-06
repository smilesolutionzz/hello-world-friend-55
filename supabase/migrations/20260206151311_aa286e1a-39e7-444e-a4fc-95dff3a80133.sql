
-- 비주얼 노트 저장 테이블
CREATE TABLE public.visual_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'counseling', -- counseling, assessment, report
  summary_data JSONB NOT NULL,
  background_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.visual_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own visual notes"
ON public.visual_notes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visual notes"
ON public.visual_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visual notes"
ON public.visual_notes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_visual_notes_user_id ON public.visual_notes(user_id);
