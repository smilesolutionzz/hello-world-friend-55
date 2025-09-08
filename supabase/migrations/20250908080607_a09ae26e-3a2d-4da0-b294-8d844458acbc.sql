-- Check and create storage policies for growth-stories bucket
SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%growth%';

-- Create policies for growth-stories bucket if they don't exist
DO $$
BEGIN
  -- Allow authenticated users to upload files to their own folder
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own growth story files'
  ) THEN
    CREATE POLICY "Users can upload their own growth story files"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'growth-stories' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Allow authenticated users to view all growth story files (since bucket is public)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Growth story files are publicly accessible'
  ) THEN
    CREATE POLICY "Growth story files are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'growth-stories');
  END IF;

  -- Allow users to delete their own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own growth story files'
  ) THEN
    CREATE POLICY "Users can delete their own growth story files"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'growth-stories' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;