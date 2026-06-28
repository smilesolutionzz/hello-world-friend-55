-- Auto-grant default therapist permissions on invite redemption.
-- Default scope: schedule (own sessions), clients (own caseload), therapy_notes,
-- parent_reports — all enforced to "own data only" by existing RLS / UI filters
-- via center_therapists.linked_user_id. Billing & admin remain opt-in only.

CREATE OR REPLACE FUNCTION public.redeem_therapist_invite_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.center_therapists%ROWTYPE;
  v_existing_perms jsonb;
  v_new_meta jsonb;
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

  -- Seed default permissions only if none were explicitly set yet.
  v_existing_perms := COALESCE(v_row.meta->'permissions', '[]'::jsonb);
  IF jsonb_array_length(v_existing_perms) = 0 THEN
    v_new_meta := COALESCE(v_row.meta, '{}'::jsonb)
      || jsonb_build_object(
        'permissions',
        jsonb_build_array('schedule', 'clients', 'therapy_notes', 'parent_reports'),
        'permission_scope', 'own'
      );
  ELSE
    v_new_meta := v_row.meta;
  END IF;

  UPDATE public.center_therapists
     SET linked_user_id = auth.uid(),
         invite_redeemed_at = now(),
         account_status = 'active',
         last_login_at = now(),
         meta = v_new_meta
   WHERE id = v_row.id;

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