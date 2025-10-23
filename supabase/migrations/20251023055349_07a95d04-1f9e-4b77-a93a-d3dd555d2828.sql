-- Ensure observation-media bucket exists and is public, and set safe storage policies
DO $$
BEGIN
  -- Create bucket if not exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'observation-media'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('observation-media', 'observation-media', true);
  END IF;

  -- Ensure bucket is public
  UPDATE storage.buckets SET public = true WHERE name = 'observation-media' AND public IS DISTINCT FROM true;
END $$;

-- Public read for observation-media (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'observation_media_public_read'
  ) THEN
    CREATE POLICY observation_media_public_read
    ON storage.objects FOR SELECT
    USING (bucket_id = 'observation-media');
  END IF;
END $$;

-- Authenticated users can upload to their own folder (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'observation_media_user_insert'
  ) THEN
    CREATE POLICY observation_media_user_insert
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'observation-media' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Allow users to delete their own files (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
      AND policyname = 'observation_media_user_delete'
  ) THEN
    CREATE POLICY observation_media_user_delete
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'observation-media' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;