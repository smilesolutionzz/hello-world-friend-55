
-- 1. Storage: ai-generated-images — owner-only SELECT
DROP POLICY IF EXISTS "Anyone can view AI generated images" ON storage.objects;
CREATE POLICY "Users can view their own AI generated images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'ai-generated-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Storage: diary-images — owner-only SELECT
DROP POLICY IF EXISTS "Anyone can view diary images" ON storage.objects;
CREATE POLICY "Users can view their own diary images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'diary-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Storage: diary-media — drop public SELECT (owner-only policy already exists)
DROP POLICY IF EXISTS "Public can view public diary media" ON storage.objects;

-- 4. Storage: b2b-attachments — restrict INSERT to authenticated owners (path-scoped)
DROP POLICY IF EXISTS "b2b_attachments_anyone_insert" ON storage.objects;
CREATE POLICY "b2b_attachments_owner_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'b2b-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. consultation_reviews — restrict SELECT to owner OR the reviewed expert
DROP POLICY IF EXISTS "Authenticated users can view consultation reviews" ON public.consultation_reviews;
CREATE POLICY "Owner or reviewed expert can view consultation reviews"
ON public.consultation_reviews FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.experts e
    WHERE e.id = consultation_reviews.expert_id AND e.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 6. institution_reviews — restrict SELECT to owner only (no public listing exists in app)
DROP POLICY IF EXISTS "Authenticated users can view institution reviews" ON public.institution_reviews;
CREATE POLICY "Owner can view own institution reviews"
ON public.institution_reviews FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- 7. user_roles — explicit admin-only INSERT/UPDATE WITH CHECK to prevent self-grant
CREATE POLICY "Only admins can insert user roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update user roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
