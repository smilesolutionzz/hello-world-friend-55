
ALTER TABLE public.expert_hour_usages
  DROP CONSTRAINT IF EXISTS expert_hour_usages_delivery_mode_check;

ALTER TABLE public.expert_hour_usages
  ADD CONSTRAINT expert_hour_usages_delivery_mode_check
  CHECK (delivery_mode IN ('online','home_visit','kakao'));

CREATE OR REPLACE FUNCTION public.consume_expert_hours(
  _pack_id uuid,
  _hours numeric,
  _delivery text DEFAULT 'online',
  _expert_id uuid DEFAULT NULL,
  _expert_name text DEFAULT NULL,
  _session_date date DEFAULT NULL,
  _note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _pack record;
  _multiplier numeric := CASE
    WHEN _delivery = 'home_visit' THEN 1.5
    WHEN _delivery = 'kakao' THEN 0.5
    ELSE 1
  END;
  _charge numeric := round((_hours * _multiplier)::numeric, 2);
  _remaining numeric;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _hours <= 0 THEN
    RAISE EXCEPTION 'hours must be positive';
  END IF;
  IF _delivery NOT IN ('online','home_visit','kakao') THEN
    RAISE EXCEPTION 'invalid delivery mode';
  END IF;

  SELECT * INTO _pack FROM public.expert_hour_packs
    WHERE id = _pack_id AND user_id = _user AND status = 'active'
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'pack not found';
  END IF;
  IF _pack.hours_remaining < _charge THEN
    RAISE EXCEPTION 'insufficient hours (need %, have %)', _charge, _pack.hours_remaining;
  END IF;

  UPDATE public.expert_hour_packs
    SET hours_remaining = hours_remaining - _charge,
        status = CASE WHEN (hours_remaining - _charge) <= 0 THEN 'depleted' ELSE status END
    WHERE id = _pack_id
    RETURNING hours_remaining INTO _remaining;

  INSERT INTO public.expert_hour_usages
    (pack_id, user_id, expert_id, expert_name, hours_used, delivery_mode, session_date, note)
  VALUES
    (_pack_id, _user, _expert_id, _expert_name, _charge, _delivery, _session_date, _note);

  RETURN jsonb_build_object(
    'success', true,
    'charged', _charge,
    'remaining', _remaining,
    'multiplier', _multiplier
  );
END;
$$;
