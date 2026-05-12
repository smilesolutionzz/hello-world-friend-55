
-- Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Partner logos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'partner-logos');

CREATE POLICY "Org admin can upload partner logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'partner-logos'
  AND EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.admin_user_id = auth.uid()
      AND o.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Org admin can update partner logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'partner-logos'
  AND EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.admin_user_id = auth.uid()
      AND o.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Org admin can delete partner logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'partner-logos'
  AND EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.admin_user_id = auth.uid()
      AND o.id::text = (storage.foldername(name))[1]
  )
);

-- Protect commission/referral-active from non-admin self edits + slug format
CREATE OR REPLACE FUNCTION public.protect_organization_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
BEGIN
  is_admin := public.has_role(auth.uid(), 'admin'::app_role);

  IF NOT is_admin THEN
    IF NEW.commission_rate IS DISTINCT FROM OLD.commission_rate THEN
      NEW.commission_rate := OLD.commission_rate;
    END IF;
    IF NEW.is_referral_active IS DISTINCT FROM OLD.is_referral_active THEN
      NEW.is_referral_active := OLD.is_referral_active;
    END IF;
  END IF;

  IF NEW.slug IS NOT NULL AND NEW.slug <> '' THEN
    IF NEW.slug !~ '^[a-z0-9][a-z0-9-]{2,39}$' THEN
      RAISE EXCEPTION 'invalid slug format: must be 3-40 chars, lowercase letters, digits, hyphens';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_organization_sensitive_fields ON public.organizations;
CREATE TRIGGER trg_protect_organization_sensitive_fields
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.protect_organization_sensitive_fields();
