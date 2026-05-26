
-- B2C ↔ Center linkage: invites, grants, onboarding progress

-- Link parent account to a center client
ALTER TABLE public.center_clients
  ADD COLUMN IF NOT EXISTS linked_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_center_clients_linked_user
  ON public.center_clients (linked_user_id);

-- Invites table
CREATE TABLE IF NOT EXISTS public.center_client_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.center_clients(id) ON DELETE CASCADE,
  invite_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  center_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  claimed_by_user_id uuid,
  claimed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invites_client ON public.center_client_invites(client_id);
CREATE INDEX IF NOT EXISTS idx_invites_center ON public.center_client_invites(center_id);

-- B2C grants (free entitlements from centers)
CREATE TABLE IF NOT EXISTS public.center_b2c_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.center_clients(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  grants jsonb NOT NULL DEFAULT '{"mind_track_7": true, "assessments_unlimited": true, "report_basic": true}'::jsonb,
  source text NOT NULL DEFAULT 'invite',
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE (center_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_grants_user ON public.center_b2c_grants(user_id);

-- Onboarding progress per center
CREATE TABLE IF NOT EXISTS public.center_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (center_id, step_key)
);

-- RLS
ALTER TABLE public.center_client_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_b2c_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Helper: is current user a member of the center?
CREATE OR REPLACE FUNCTION public.is_center_member(_center_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.center_members
    WHERE center_id = _center_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.center_organizations
    WHERE id = _center_id AND owner_id = auth.uid()
  )
$$;

-- Invites policies: center members manage; parent can read by token (public lookup via edge function)
CREATE POLICY "members manage invites"
  ON public.center_client_invites FOR ALL
  USING (public.is_center_member(center_id))
  WITH CHECK (public.is_center_member(center_id));

-- Grants policies
CREATE POLICY "members read grants"
  ON public.center_b2c_grants FOR SELECT
  USING (public.is_center_member(center_id));

CREATE POLICY "user reads own grants"
  ON public.center_b2c_grants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "members insert grants"
  ON public.center_b2c_grants FOR INSERT
  WITH CHECK (public.is_center_member(center_id));

-- Onboarding progress
CREATE POLICY "members manage onboarding"
  ON public.center_onboarding_progress FOR ALL
  USING (public.is_center_member(center_id))
  WITH CHECK (public.is_center_member(center_id));

-- Short 6-char code generator
CREATE OR REPLACE FUNCTION public.generate_center_code()
RETURNS text
LANGUAGE plpgsql VOLATILE
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  attempts int := 0;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random()*length(chars))::int + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.center_client_invites WHERE center_code = code);
    attempts := attempts + 1;
    IF attempts > 10 THEN RAISE EXCEPTION 'cannot generate unique code'; END IF;
  END LOOP;
  RETURN code;
END;
$$;
