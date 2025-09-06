-- Create storage bucket for community posts
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('community-media', 'community-media', true);

-- Create RLS policies for community media uploads
CREATE POLICY "Users can upload their own community media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Community media is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'community-media');

CREATE POLICY "Users can update their own community media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own community media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);