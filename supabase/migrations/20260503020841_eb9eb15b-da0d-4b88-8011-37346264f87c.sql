
CREATE TABLE public.mind_track_focus_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL,
  from_focus TEXT,
  to_focus TEXT NOT NULL,
  day_when_changed INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mind_track_focus_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own focus changes"
ON public.mind_track_focus_changes FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users insert own focus changes"
ON public.mind_track_focus_changes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_mtfc_user ON public.mind_track_focus_changes(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.switch_mind_track_focus(
  _enrollment_id UUID,
  _new_focus TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _row RECORD;
  _current_day INT;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT id, user_id, goal_focus, started_at, status
  INTO _row
  FROM public.mind_track_enrollments
  WHERE id = _enrollment_id AND user_id = _user_id
  LIMIT 1;

  IF _row.id IS NULL THEN
    RAISE EXCEPTION 'enrollment_not_found_or_forbidden';
  END IF;

  IF _row.status = 'completed' THEN
    RAISE EXCEPTION 'enrollment_completed';
  END IF;

  IF _new_focus IS NULL OR length(trim(_new_focus)) = 0 THEN
    RAISE EXCEPTION 'invalid_focus';
  END IF;

  _current_day := GREATEST(
    1,
    LEAST(30, COALESCE(EXTRACT(DAY FROM (now() - _row.started_at))::INT + 1, 1))
  );

  UPDATE public.mind_track_enrollments
  SET goal_focus = _new_focus, updated_at = now()
  WHERE id = _enrollment_id;

  INSERT INTO public.mind_track_focus_changes(user_id, enrollment_id, from_focus, to_focus, day_when_changed)
  VALUES (_user_id, _enrollment_id, _row.goal_focus, _new_focus, _current_day);

  RETURN jsonb_build_object(
    'ok', true,
    'enrollment_id', _enrollment_id,
    'from_focus', _row.goal_focus,
    'to_focus', _new_focus,
    'current_day', _current_day
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.switch_mind_track_focus(UUID, TEXT) TO authenticated;

CREATE TABLE public.mind_track_content_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_checked INT NOT NULL DEFAULT 0,
  total_failed INT NOT NULL DEFAULT 0,
  failed_items JSONB,
  notes TEXT
);

ALTER TABLE public.mind_track_content_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins view audit log"
ON public.mind_track_content_audit_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
