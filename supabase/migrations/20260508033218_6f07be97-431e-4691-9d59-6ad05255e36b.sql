-- 1. memberships
DROP POLICY IF EXISTS "System can insert memberships" ON public.memberships;
DROP POLICY IF EXISTS "Family owners can insert memberships" ON public.memberships;
CREATE POLICY "Family owners can insert memberships"
ON public.memberships FOR INSERT TO authenticated
WITH CHECK (auth.uid() = family_owner_id);

-- 2. invites
DROP POLICY IF EXISTS "System can update invites" ON public.invites;
DROP POLICY IF EXISTS "Invitees can accept their own invite" ON public.invites;
DROP POLICY IF EXISTS "Inviters can update their own invites" ON public.invites;
CREATE POLICY "Invitees can accept their own invite"
ON public.invites FOR UPDATE TO authenticated
USING (email = auth.email()) WITH CHECK (email = auth.email());
CREATE POLICY "Inviters can update their own invites"
ON public.invites FOR UPDATE TO authenticated
USING (auth.uid() = inviter_id) WITH CHECK (auth.uid() = inviter_id);

-- 3. consultation_reviews
DROP POLICY IF EXISTS "Allow public read consultation_reviews" ON public.consultation_reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.consultation_reviews;
DROP POLICY IF EXISTS "Authenticated users can view consultation reviews" ON public.consultation_reviews;
CREATE POLICY "Authenticated users can view consultation reviews"
ON public.consultation_reviews FOR SELECT TO authenticated
USING (true);

-- 4. partner_institutions
DROP POLICY IF EXISTS "Authenticated users can view institution basic info" ON public.partner_institutions;

CREATE OR REPLACE VIEW public.partner_institutions_public
WITH (security_invoker = true) AS
SELECT
  id, name, institution_type, address, website_url, description,
  latitude, longitude, is_voucher_approved, voucher_types,
  established_year, total_experts, rating, review_count,
  profile_image_url, gallery_images, operating_hours,
  services_offered, partnership_status, created_at, updated_at
FROM public.partner_institutions
WHERE partnership_status = 'active';

GRANT SELECT ON public.partner_institutions_public TO anon, authenticated;

-- 5. institution_reviews
DROP POLICY IF EXISTS "Institution reviews are viewable by everyone" ON public.institution_reviews;
DROP POLICY IF EXISTS "Authenticated users can view institution reviews" ON public.institution_reviews;
CREATE POLICY "Authenticated users can view institution reviews"
ON public.institution_reviews FOR SELECT TO authenticated
USING (true);