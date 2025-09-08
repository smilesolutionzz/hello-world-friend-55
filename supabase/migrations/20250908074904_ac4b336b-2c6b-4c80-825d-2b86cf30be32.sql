-- growth_stories 테이블에 미디어 파일 관련 컬럼 추가
ALTER TABLE public.growth_stories 
ADD COLUMN media_files TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN media_types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 스토리지 버킷 생성 (growth-stories)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('growth-stories', 'growth-stories', true);

-- 스토리지 RLS 정책 설정
-- 모든 사용자가 파일을 볼 수 있도록 (공개 버킷)
CREATE POLICY "Growth story files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'growth-stories');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Users can upload growth story files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'growth-stories' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 사용자는 자신이 업로드한 파일만 수정/삭제 가능
CREATE POLICY "Users can update their own growth story files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'growth-stories' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own growth story files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'growth-stories' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);