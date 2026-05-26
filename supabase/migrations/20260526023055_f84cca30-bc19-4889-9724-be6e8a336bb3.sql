
-- center_invites 테이블
CREATE TABLE IF NOT EXISTS public.center_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'therapist',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_center_invites_center ON public.center_invites(center_id);
CREATE INDEX IF NOT EXISTS idx_center_invites_token ON public.center_invites(token);
CREATE INDEX IF NOT EXISTS idx_center_invites_email ON public.center_invites(lower(email));

ALTER TABLE public.center_invites ENABLE ROW LEVEL SECURITY;

-- helper: owner/admin 인지
CREATE OR REPLACE FUNCTION public.is_center_admin(_center_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.center_members
    WHERE center_id = _center_id AND user_id = _user_id AND role IN ('owner', 'admin')
  );
$$;

-- RLS: owner/admin 조회·생성
DROP POLICY IF EXISTS "Center admins view invites" ON public.center_invites;
CREATE POLICY "Center admins view invites" ON public.center_invites
FOR SELECT TO authenticated
USING (public.is_center_admin(center_id, auth.uid()));

DROP POLICY IF EXISTS "Center admins insert invites" ON public.center_invites;
CREATE POLICY "Center admins insert invites" ON public.center_invites
FOR INSERT TO authenticated
WITH CHECK (public.is_center_admin(center_id, auth.uid()) AND invited_by = auth.uid());

-- RPC: 초대 생성
CREATE OR REPLACE FUNCTION public.create_center_invite(
  _center_id uuid, _email text, _role text DEFAULT 'therapist'
) RETURNS public.center_invites
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _row public.center_invites;
  _token text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF NOT public.is_center_admin(_center_id, _uid) THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;
  _token := encode(gen_random_bytes(24), 'hex');
  INSERT INTO public.center_invites(center_id, email, role, token, invited_by)
  VALUES (_center_id, lower(_email), _role, _token, _uid)
  RETURNING * INTO _row;
  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.create_center_invite(uuid, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_center_invite(uuid, text, text) TO authenticated;

-- RPC: 초대 수락
CREATE OR REPLACE FUNCTION public.accept_center_invite(_token text)
RETURNS public.center_organizations
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _inv public.center_invites;
  _org public.center_organizations;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT * INTO _inv FROM public.center_invites WHERE token = _token;
  IF _inv IS NULL THEN RAISE EXCEPTION 'INVITE_NOT_FOUND'; END IF;
  IF _inv.accepted_at IS NOT NULL THEN RAISE EXCEPTION 'INVITE_USED'; END IF;
  IF _inv.expires_at < now() THEN RAISE EXCEPTION 'INVITE_EXPIRED'; END IF;

  INSERT INTO public.center_members(center_id, user_id, role)
  VALUES (_inv.center_id, _uid, _inv.role)
  ON CONFLICT (center_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  UPDATE public.center_invites SET accepted_at = now(), accepted_by = _uid WHERE id = _inv.id;
  SELECT * INTO _org FROM public.center_organizations WHERE id = _inv.center_id;
  RETURN _org;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_center_invite(text) FROM public;
GRANT EXECUTE ON FUNCTION public.accept_center_invite(text) TO authenticated;
