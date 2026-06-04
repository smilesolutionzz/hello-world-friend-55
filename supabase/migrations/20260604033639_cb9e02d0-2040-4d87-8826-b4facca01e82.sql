
ALTER TABLE public.center_organizations
  ADD COLUMN IF NOT EXISTS storefront_slug TEXT UNIQUE;

CREATE OR REPLACE FUNCTION public.ensure_center_storefront(_center_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _role text;
  _slug text;
  _name text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT role::text INTO _role
  FROM public.center_members
  WHERE center_id = _center_id AND user_id = _uid
  LIMIT 1;

  IF _role IS NULL OR _role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  SELECT storefront_slug, name INTO _slug, _name
  FROM public.center_organizations
  WHERE id = _center_id;

  IF _slug IS NULL OR _slug = '' THEN
    _slug := 'center-' || lower(substr(replace(_center_id::text, '-', ''), 1, 10));
    UPDATE public.center_organizations
       SET storefront_slug = _slug
     WHERE id = _center_id;
  END IF;

  INSERT INTO public.partner_owners (partner_slug, user_id)
  VALUES (_slug, _uid)
  ON CONFLICT DO NOTHING;

  RETURN _slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_center_storefront(uuid) TO authenticated;
