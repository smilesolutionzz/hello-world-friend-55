-- 랜딩 페이지 이미지 업로드: partner-media 버킷의 `landing/{center_id}/...` 경로
-- 공개 read는 기존 "Public read partner media" 정책으로 충족됨.

DROP POLICY IF EXISTS "Center members upload landing media" ON storage.objects;
CREATE POLICY "Center members upload landing media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'partner-media'
  AND (storage.foldername(name))[1] = 'landing'
  AND public.is_center_member(((storage.foldername(name))[2])::uuid)
);

DROP POLICY IF EXISTS "Center members update landing media" ON storage.objects;
CREATE POLICY "Center members update landing media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'partner-media'
  AND (storage.foldername(name))[1] = 'landing'
  AND public.is_center_member(((storage.foldername(name))[2])::uuid)
);

DROP POLICY IF EXISTS "Center members delete landing media" ON storage.objects;
CREATE POLICY "Center members delete landing media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'partner-media'
  AND (storage.foldername(name))[1] = 'landing'
  AND public.is_center_member(((storage.foldername(name))[2])::uuid)
);