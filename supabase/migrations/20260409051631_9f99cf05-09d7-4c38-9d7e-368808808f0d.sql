-- Fix remaining referral_rewards policy
DROP POLICY IF EXISTS "service_role_insert_referral_rewards" ON public.referral_rewards;
CREATE POLICY "service_role_insert_referral_rewards"
  ON public.referral_rewards FOR INSERT TO service_role WITH CHECK (true);

-- Fix diary-slideshows storage policies with ownership checks
DROP POLICY IF EXISTS "Users can read slideshow videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload slideshow videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete slideshow videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own slideshow videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own slideshow videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own slideshow videos" ON storage.objects;

CREATE POLICY "Users can read own slideshow videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'diary-slideshows' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload own slideshow videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'diary-slideshows' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own slideshow videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'diary-slideshows' AND (storage.foldername(name))[1] = auth.uid()::text);