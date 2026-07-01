
-- 1. b2b_partner_institutions: auto-clear expired join codes
CREATE OR REPLACE FUNCTION public.clear_expired_join_codes()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.join_code_expires_at IS NOT NULL AND NEW.join_code_expires_at < now() THEN
    NEW.join_code := NULL;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_clear_expired_join_codes ON public.b2b_partner_institutions;
CREATE TRIGGER trg_clear_expired_join_codes
  BEFORE INSERT OR UPDATE ON public.b2b_partner_institutions
  FOR EACH ROW EXECUTE FUNCTION public.clear_expired_join_codes();

UPDATE public.b2b_partner_institutions
  SET join_code = NULL
  WHERE join_code IS NOT NULL
    AND join_code_expires_at IS NOT NULL
    AND join_code_expires_at < now();

-- 2. center_parent_share_links: tighten INSERT/SELECT to center staff only
DROP POLICY IF EXISTS "Creators can insert share links" ON public.center_parent_share_links;
CREATE POLICY "Center staff can insert share links"
  ON public.center_parent_share_links
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.center_members m
      WHERE m.center_id = center_parent_share_links.center_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Creators can view their share links" ON public.center_parent_share_links;
CREATE POLICY "Center staff can view their share links"
  ON public.center_parent_share_links
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.center_members m
      WHERE m.center_id = center_parent_share_links.center_id
        AND m.user_id = auth.uid()
    )
  );

-- 3. teen_risk_referrals: hash guardian_token and revoke direct read
ALTER TABLE public.teen_risk_referrals
  ADD COLUMN IF NOT EXISTS guardian_token_hash text;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE public.teen_risk_referrals
  SET guardian_token_hash = encode(digest(guardian_token, 'sha256'), 'hex')
  WHERE guardian_token IS NOT NULL AND guardian_token_hash IS NULL;

REVOKE SELECT (guardian_token, guardian_contact_phone, guardian_contact_email)
  ON public.teen_risk_referrals FROM authenticated, anon;

-- 4. user_profiles: ensure anon cannot read emails (defense-in-depth)
REVOKE SELECT ON public.user_profiles FROM anon;

-- 5. family_members: reaffirm owner-only grants (already correct via RLS)
REVOKE SELECT ON public.family_members FROM anon;
