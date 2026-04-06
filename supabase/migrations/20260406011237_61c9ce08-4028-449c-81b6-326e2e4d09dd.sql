
-- 1. Fix user_analytics_events: remove NULL user_id access for non-admins
DROP POLICY IF EXISTS "Users can read their own analytics events" ON public.user_analytics_events;
CREATE POLICY "Users can read their own analytics events"
  ON public.user_analytics_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own analytics events" ON public.user_analytics_events;
CREATE POLICY "Users can insert their own analytics events"
  ON public.user_analytics_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Fix payments: restrict INSERT to service_role only
DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.payments;
CREATE POLICY "service_role_insert_payments"
  ON public.payments FOR INSERT TO service_role
  WITH CHECK (true);

-- 3. Fix referral_rewards: restrict INSERT to service_role only
DROP POLICY IF EXISTS "System can insert referral rewards" ON public.referral_rewards;
CREATE POLICY "service_role_insert_referral_rewards"
  ON public.referral_rewards FOR INSERT TO service_role
  WITH CHECK (true);

-- 4. Fix test_types: restrict INSERT to admins only
DROP POLICY IF EXISTS "Users can insert test types" ON public.test_types;
CREATE POLICY "Admins can insert test types"
  ON public.test_types FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Fix storage: add ownership checks for ai-generated-images DELETE and UPDATE
DROP POLICY IF EXISTS "Users can delete their own AI generated images" ON storage.objects;
CREATE POLICY "Users can delete their own AI generated images"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'ai-generated-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own AI generated images" ON storage.objects;
CREATE POLICY "Users can update their own AI generated images"
  ON storage.objects FOR UPDATE TO public
  USING (bucket_id = 'ai-generated-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 6. Fix storage: add ownership checks for diary-images DELETE
DROP POLICY IF EXISTS "Users can delete their own diary images" ON storage.objects;
CREATE POLICY "Users can delete their own diary images"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'diary-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
