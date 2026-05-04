-- B2B 문의에 첨부파일과 희망 미팅 시간 컬럼 추가
ALTER TABLE public.b2b_ad_inquiries
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_filename text,
  ADD COLUMN IF NOT EXISTS preferred_contact_at timestamptz;

-- B2B 첨부파일용 비공개 bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('b2b-attachments', 'b2b-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- bucket 정책: 누구나(익명 포함) 본인이 업로드한 파일만 INSERT 가능 (도입 문의는 비로그인 가능해야 함)
-- 폴더 구조: <random-uuid>/<filename> — 추측 불가능한 경로 사용
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='b2b_attachments_anyone_insert'
  ) THEN
    CREATE POLICY "b2b_attachments_anyone_insert"
      ON storage.objects FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'b2b-attachments');
  END IF;

  -- 읽기는 service_role만 (관리자가 admin 페이지에서 signed URL 발급해 열람)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='b2b_attachments_no_public_read'
  ) THEN
    CREATE POLICY "b2b_attachments_no_public_read"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'b2b-attachments'
        AND public.has_role(auth.uid(), 'admin'::public.app_role)
      );
  END IF;
END $$;