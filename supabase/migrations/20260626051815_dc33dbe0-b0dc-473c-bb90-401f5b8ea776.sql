
-- Allow center members to upload/read/delete photos in center-session-uploads bucket
-- Path convention: {center_id}/{client_id}/{filename}

DO $$
BEGIN
  -- INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='center_session_uploads_insert') THEN
    CREATE POLICY center_session_uploads_insert ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'center-session-uploads'
        AND EXISTS (
          SELECT 1 FROM public.center_members cm
          WHERE cm.center_id::text = (storage.foldername(name))[1]
            AND cm.user_id = auth.uid()
        )
      );
  END IF;

  -- SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='center_session_uploads_select') THEN
    CREATE POLICY center_session_uploads_select ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'center-session-uploads'
        AND EXISTS (
          SELECT 1 FROM public.center_members cm
          WHERE cm.center_id::text = (storage.foldername(name))[1]
            AND cm.user_id = auth.uid()
        )
      );
  END IF;

  -- DELETE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='center_session_uploads_delete') THEN
    CREATE POLICY center_session_uploads_delete ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'center-session-uploads'
        AND EXISTS (
          SELECT 1 FROM public.center_members cm
          WHERE cm.center_id::text = (storage.foldername(name))[1]
            AND cm.user_id = auth.uid()
        )
      );
  END IF;
END$$;
