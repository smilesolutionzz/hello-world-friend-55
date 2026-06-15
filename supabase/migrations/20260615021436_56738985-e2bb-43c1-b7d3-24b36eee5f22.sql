CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.create_center_invite(
  _center_id uuid, _email text, _role text DEFAULT 'therapist'
) RETURNS public.center_invites
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  _uid uuid := auth.uid();
  _row public.center_invites;
  _token text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF NOT public.is_center_admin(_center_id, _uid) THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;
  _token := encode(extensions.gen_random_bytes(24), 'hex');
  INSERT INTO public.center_invites(center_id, email, role, token, invited_by)
  VALUES (_center_id, lower(_email), _role, _token, _uid)
  RETURNING * INTO _row;
  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.create_center_invite(uuid, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_center_invite(uuid, text, text) TO authenticated;