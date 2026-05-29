-- 1) Therapist self-login linkage
ALTER TABLE public.center_therapists
  ADD COLUMN IF NOT EXISTS linked_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_center_therapists_linked_user
  ON public.center_therapists(linked_user_id);

-- 2) Therapist can read own profile rows
DROP POLICY IF EXISTS "Therapists can view own profile" ON public.center_therapists;
CREATE POLICY "Therapists can view own profile"
ON public.center_therapists
FOR SELECT
TO authenticated
USING (linked_user_id = auth.uid());

-- 3) Therapist can read and update own sessions
DROP POLICY IF EXISTS "Therapists can view own sessions" ON public.center_sessions;
CREATE POLICY "Therapists can view own sessions"
ON public.center_sessions
FOR SELECT
TO authenticated
USING (
  therapist_id IN (
    SELECT id FROM public.center_therapists WHERE linked_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Therapists can update own session status" ON public.center_sessions;
CREATE POLICY "Therapists can update own session status"
ON public.center_sessions
FOR UPDATE
TO authenticated
USING (
  therapist_id IN (
    SELECT id FROM public.center_therapists WHERE linked_user_id = auth.uid()
  )
)
WITH CHECK (
  therapist_id IN (
    SELECT id FROM public.center_therapists WHERE linked_user_id = auth.uid()
  )
);

-- 4) Therapist can read client/program names for their sessions
DROP POLICY IF EXISTS "Therapists can view clients of own sessions" ON public.center_clients;
CREATE POLICY "Therapists can view clients of own sessions"
ON public.center_clients
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT s.client_id FROM public.center_sessions s
    WHERE s.therapist_id IN (
      SELECT id FROM public.center_therapists WHERE linked_user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Therapists can view programs of own center" ON public.center_programs;
CREATE POLICY "Therapists can view programs of own center"
ON public.center_programs
FOR SELECT
TO authenticated
USING (
  center_id IN (
    SELECT center_id FROM public.center_therapists WHERE linked_user_id = auth.uid()
  )
);

-- 5) Import job options column
ALTER TABLE public.center_import_jobs
  ADD COLUMN IF NOT EXISTS import_options jsonb DEFAULT '{}'::jsonb;

-- 6) RPC: link therapist to current user by email (simple self-claim by login_account)
CREATE OR REPLACE FUNCTION public.claim_therapist_account(_login_account text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _therapist_id uuid;
  _uid uuid;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT id INTO _therapist_id
  FROM public.center_therapists
  WHERE lower(login_account) = lower(_login_account)
    AND linked_user_id IS NULL
  LIMIT 1;

  IF _therapist_id IS NULL THEN
    RAISE EXCEPTION 'THERAPIST_NOT_FOUND_OR_ALREADY_CLAIMED';
  END IF;

  UPDATE public.center_therapists
    SET linked_user_id = _uid,
        account_status = 'active',
        last_login_at = now()
  WHERE id = _therapist_id;

  RETURN _therapist_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_therapist_account(text) TO authenticated;