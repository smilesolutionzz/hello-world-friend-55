-- Create storage bucket for expert profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('expert-profiles', 'expert-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for expert-profiles bucket
CREATE POLICY "Expert profiles are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'expert-profiles');

CREATE POLICY "Admins can upload expert profiles"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'expert-profiles' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update expert profiles"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'expert-profiles' AND
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete expert profiles"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'expert-profiles' AND
  has_role(auth.uid(), 'admin'::app_role)
);