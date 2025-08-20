-- Check if policies already exist and drop them if they do
DROP POLICY IF EXISTS "Users can view their own observation media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own observation media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own observation media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own observation media" ON storage.objects;

-- Create policies for observation media uploads
CREATE POLICY "Users can view their own observation media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'observation-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own observation media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'observation-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own observation media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'observation-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own observation media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'observation-media' AND auth.uid()::text = (storage.foldername(name))[1]);