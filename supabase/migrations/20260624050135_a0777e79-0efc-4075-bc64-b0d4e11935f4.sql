
-- 1) partner_service_info: require authentication for SELECT
DROP POLICY IF EXISTS "제휴기관 서비스 정보는 모든 사용자가 조회 가" ON public.partner_service_info;
CREATE POLICY "Authenticated users can view active partner services"
ON public.partner_service_info
FOR SELECT
TO authenticated
USING (is_active = true);

-- 2) life_achievement_shares: stop exposing user_id via public rows; restrict reads to owner
DROP POLICY IF EXISTS "Users can view public shares" ON public.life_achievement_shares;
CREATE POLICY "Users can view their own shares"
ON public.life_achievement_shares
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3) b2b-attachments storage bucket: allow owners (by folder) to update/delete their files
CREATE POLICY "b2b_attachments_owner_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'b2b-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'b2b-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "b2b_attachments_owner_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'b2b-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
