
-- 1. ai-generated-images bucket: enforce path ownership on INSERT
DROP POLICY IF EXISTS "Authenticated users can upload AI generated images" ON storage.objects;
CREATE POLICY "Authenticated users can upload AI generated images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'ai-generated-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. diary-images bucket: enforce path ownership on INSERT + add UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can upload diary images" ON storage.objects;
CREATE POLICY "Authenticated users can upload diary images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'diary-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update their own diary images" ON storage.objects;
CREATE POLICY "Users can update their own diary images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'diary-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'diary-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. center_clients: exclude viewer role from SELECT (PII)
DROP POLICY IF EXISTS center_clients_select_admin ON public.center_clients;
CREATE POLICY center_clients_select_admin
ON public.center_clients FOR SELECT TO authenticated
USING (has_center_role(center_id, ARRAY['owner'::center_role, 'admin'::center_role]));

-- 4. center_therapists: restrict full SELECT to owner/admin only; therapists keep own-profile policy
DROP POLICY IF EXISTS center_therapists_select ON public.center_therapists;
CREATE POLICY center_therapists_select
ON public.center_therapists FOR SELECT TO authenticated
USING (has_center_role(center_id, ARRAY['owner'::center_role, 'admin'::center_role]));

-- 5. b2b_ad_analytics: add SELECT for institution owners
CREATE POLICY "Institution owners can view own ad analytics"
ON public.b2b_ad_analytics FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions pi
    WHERE pi.id = b2b_ad_analytics.institution_id AND pi.user_id = auth.uid()
  )
);

-- 6. center_parent_share_links: protect plaintext E.164 column at column level
REVOKE SELECT (parent_phone_e164) ON public.center_parent_share_links FROM authenticated, anon;

-- 7. resident_families: restrict staff SELECT to facility admins only
DROP POLICY IF EXISTS "Facility staff can view families" ON public.resident_families;
CREATE POLICY "Facility admins can view families"
ON public.resident_families FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.residents r
    WHERE r.id = resident_families.resident_id
      AND is_facility_admin(r.facility_id)
  )
);

-- 8. residents: restrict full-row SELECT (medical PII) to facility admins
DROP POLICY IF EXISTS "Facility staff can view residents" ON public.residents;
CREATE POLICY "Facility admins can view residents"
ON public.residents FOR SELECT TO authenticated
USING (is_facility_admin(facility_id));
