
-- 1) b2b-attachments: allow uploader to read own files
DROP POLICY IF EXISTS "b2b_attachments_owner_read" ON storage.objects;
CREATE POLICY "b2b_attachments_owner_read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'b2b-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2) b2b-resources: admin UPDATE/DELETE policies
DROP POLICY IF EXISTS "b2b_resources_admin_update" ON storage.objects;
CREATE POLICY "b2b_resources_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'b2b-resources' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'b2b-resources' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "b2b_resources_admin_delete" ON storage.objects;
CREATE POLICY "b2b_resources_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'b2b-resources' AND public.has_role(auth.uid(), 'admin'));

-- 3) profiles: ensure admin SELECT policy uses has_role explicitly (defense-in-depth)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
