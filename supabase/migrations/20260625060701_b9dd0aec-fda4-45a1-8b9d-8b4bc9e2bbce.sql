
-- 1. center_therapists: invite code columns
ALTER TABLE public.center_therapists
  ADD COLUMN IF NOT EXISTS invite_code text,
  ADD COLUMN IF NOT EXISTS invite_code_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS invite_redeemed_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS center_therapists_invite_code_key
  ON public.center_therapists (invite_code) WHERE invite_code IS NOT NULL;

-- 2. helper: generate 6-char invite code (A-Z + 2-9)
CREATE OR REPLACE FUNCTION public.generate_therapist_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
  exists_row uuid;
BEGIN
  FOR attempt IN 1..10 LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1);
    END LOOP;
    SELECT id INTO exists_row FROM public.center_therapists WHERE invite_code = code;
    IF exists_row IS NULL THEN
      RETURN code;
    END IF;
  END LOOP;
  RAISE EXCEPTION 'Could not generate unique invite code';
END;
$$;

-- 3. RPC: issue/regenerate invite code (admin/owner only)
CREATE OR REPLACE FUNCTION public.issue_therapist_invite_code(_therapist_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_center_id uuid;
  v_code text;
  v_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;
  SELECT center_id INTO v_center_id FROM public.center_therapists WHERE id = _therapist_id;
  IF v_center_id IS NULL THEN
    RAISE EXCEPTION 'THERAPIST_NOT_FOUND';
  END IF;
  SELECT role::text INTO v_role FROM public.center_members
    WHERE center_id = v_center_id AND user_id = auth.uid();
  IF v_role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  v_code := public.generate_therapist_invite_code();
  UPDATE public.center_therapists
     SET invite_code = v_code,
         invite_code_expires_at = now() + interval '30 days',
         invite_redeemed_at = NULL
   WHERE id = _therapist_id;
  RETURN v_code;
END;
$$;

-- 4. RPC: redeem invite code (any logged-in user)
CREATE OR REPLACE FUNCTION public.redeem_therapist_invite_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.center_therapists%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;
  SELECT * INTO v_row FROM public.center_therapists
    WHERE invite_code = upper(trim(_code));
  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'CODE_NOT_FOUND';
  END IF;
  IF v_row.invite_code_expires_at IS NOT NULL AND v_row.invite_code_expires_at < now() THEN
    RAISE EXCEPTION 'CODE_EXPIRED';
  END IF;
  IF v_row.linked_user_id IS NOT NULL AND v_row.linked_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'CODE_ALREADY_USED';
  END IF;

  UPDATE public.center_therapists
     SET linked_user_id = auth.uid(),
         invite_redeemed_at = now(),
         account_status = 'active',
         last_login_at = now()
   WHERE id = v_row.id;

  -- ensure center_members row with role 'therapist'
  INSERT INTO public.center_members (center_id, user_id, role)
  VALUES (v_row.center_id, auth.uid(), 'therapist')
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'therapist_id', v_row.id,
    'center_id', v_row.center_id,
    'name', v_row.name
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.issue_therapist_invite_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_therapist_invite_code(text) TO authenticated;

-- 5. center_parent_reports: allow therapists to insert/update weekly reports for own clients
DROP POLICY IF EXISTS "Therapists can insert weekly reports for own clients" ON public.center_parent_reports;
CREATE POLICY "Therapists can insert weekly reports for own clients"
  ON public.center_parent_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    period_type = 'weekly'
    AND EXISTS (
      SELECT 1 FROM public.center_sessions s
      JOIN public.center_therapists t ON t.id = s.therapist_id
      WHERE s.client_id = center_parent_reports.client_id
        AND s.center_id = center_parent_reports.center_id
        AND t.linked_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Therapists can update weekly reports for own clients" ON public.center_parent_reports;
CREATE POLICY "Therapists can update weekly reports for own clients"
  ON public.center_parent_reports FOR UPDATE
  TO authenticated
  USING (
    period_type = 'weekly'
    AND EXISTS (
      SELECT 1 FROM public.center_sessions s
      JOIN public.center_therapists t ON t.id = s.therapist_id
      WHERE s.client_id = center_parent_reports.client_id
        AND s.center_id = center_parent_reports.center_id
        AND t.linked_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Therapists can view weekly reports for own clients" ON public.center_parent_reports;
CREATE POLICY "Therapists can view weekly reports for own clients"
  ON public.center_parent_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.center_sessions s
      JOIN public.center_therapists t ON t.id = s.therapist_id
      WHERE s.client_id = center_parent_reports.client_id
        AND s.center_id = center_parent_reports.center_id
        AND t.linked_user_id = auth.uid()
    )
  );

-- 6. center_clients: therapist limited UPDATE policy
DROP POLICY IF EXISTS "Therapists can update own clients limited" ON public.center_clients;
CREATE POLICY "Therapists can update own clients limited"
  ON public.center_clients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.center_sessions s
      JOIN public.center_therapists t ON t.id = s.therapist_id
      WHERE s.client_id = center_clients.id
        AND t.linked_user_id = auth.uid()
    )
  );

-- 7. trigger: prevent therapist from changing protected fields
CREATE OR REPLACE FUNCTION public.center_clients_protect_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- if updater is owner/admin of this center, allow all changes
  SELECT EXISTS (
    SELECT 1 FROM public.center_members
    WHERE center_id = NEW.center_id
      AND user_id = auth.uid()
      AND role::text IN ('owner','admin')
  ) INTO v_is_admin;

  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  -- non-admin (therapist): restrict mutable fields
  IF NEW.name IS DISTINCT FROM OLD.name
     OR NEW.birth_date IS DISTINCT FROM OLD.birth_date
     OR NEW.linked_user_id IS DISTINCT FROM OLD.linked_user_id
     OR NEW.center_id IS DISTINCT FROM OLD.center_id
     OR NEW.member_no IS DISTINCT FROM OLD.member_no
     OR NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'THERAPIST_PROTECTED_FIELD_CHANGE';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS center_clients_protect_fields_trg ON public.center_clients;
CREATE TRIGGER center_clients_protect_fields_trg
  BEFORE UPDATE ON public.center_clients
  FOR EACH ROW EXECUTE FUNCTION public.center_clients_protect_fields();
