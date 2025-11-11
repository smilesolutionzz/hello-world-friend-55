-- 교육 콘텐츠 북마크 테이블
CREATE TABLE IF NOT EXISTS public.education_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.curated_education_content(id) ON DELETE CASCADE,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- RLS 정책
ALTER TABLE public.education_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bookmarks"
  ON public.education_bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_education_bookmarks_user ON public.education_bookmarks(user_id, created_at DESC);
CREATE INDEX idx_education_bookmarks_category ON public.education_bookmarks(user_id, category);