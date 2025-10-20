-- 고민 저장소 테이블 생성
CREATE TABLE public.concern_storage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concern_text TEXT NOT NULL,
  analysis_type TEXT,
  analysis_severity TEXT,
  analysis_advice TEXT,
  recommended_tests JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 활성화
ALTER TABLE public.concern_storage ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 고민만 조회 가능
CREATE POLICY "Users can view their own concerns"
  ON public.concern_storage
  FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 고민 생성 가능
CREATE POLICY "Users can create their own concerns"
  ON public.concern_storage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 고민 수정 가능
CREATE POLICY "Users can update their own concerns"
  ON public.concern_storage
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 사용자는 자신의 고민 삭제 가능
CREATE POLICY "Users can delete their own concerns"
  ON public.concern_storage
  FOR DELETE
  USING (auth.uid() = user_id);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION public.update_concern_storage_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 트리거 생성
CREATE TRIGGER update_concern_storage_updated_at
  BEFORE UPDATE ON public.concern_storage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_concern_storage_updated_at();