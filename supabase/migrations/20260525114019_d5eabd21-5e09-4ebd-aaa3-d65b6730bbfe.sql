
CREATE TABLE IF NOT EXISTS public.expert_hour_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pack_size integer NOT NULL CHECK (pack_size IN (5,10,20,30)),
  hours_total numeric(6,2) NOT NULL,
  hours_remaining numeric(6,2) NOT NULL,
  price_paid integer NOT NULL,
  payment_id uuid,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expert_hour_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hour_packs_own_select" ON public.expert_hour_packs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "hour_packs_own_insert" ON public.expert_hour_packs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_expert_hour_packs_user ON public.expert_hour_packs(user_id, status);

CREATE TABLE IF NOT EXISTS public.expert_hour_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id uuid NOT NULL REFERENCES public.expert_hour_packs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  expert_id uuid,
  expert_name text,
  hours_used numeric(6,2) NOT NULL,
  delivery_mode text NOT NULL DEFAULT 'online' CHECK (delivery_mode IN ('online','home_visit')),
  session_date date,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expert_hour_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hour_usages_own_select" ON public.expert_hour_usages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "hour_usages_own_insert" ON public.expert_hour_usages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_expert_hour_usages_pack ON public.expert_hour_usages(pack_id);

CREATE OR REPLACE FUNCTION public.consume_expert_hours(
  _pack_id uuid,
  _hours numeric,
  _delivery text DEFAULT 'online',
  _expert_name text DEFAULT NULL,
  _expert_id uuid DEFAULT NULL,
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
  _multiplier numeric := CASE WHEN _delivery = 'home_visit' THEN 1.5 ELSE 1 END;
  _charge numeric := round((_hours * _multiplier)::numeric, 2);
  _remaining numeric;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  IF _hours IS NULL OR _hours <= 0 THEN
    RAISE EXCEPTION 'invalid hours';
  END IF;
  IF _delivery NOT IN ('online','home_visit') THEN
    RAISE EXCEPTION 'invalid delivery mode';
  END IF;

  SELECT hours_remaining INTO _remaining
  FROM public.expert_hour_packs
  WHERE id = _pack_id AND user_id = _user AND status = 'active'
  FOR UPDATE;

  IF _remaining IS NULL THEN
    RAISE EXCEPTION 'pack not found or inactive';
  END IF;
  IF _remaining < _charge THEN
    RAISE EXCEPTION 'insufficient hours (need %, have %)', _charge, _remaining;
  END IF;

  UPDATE public.expert_hour_packs
     SET hours_remaining = _remaining - _charge,
         status = CASE WHEN (_remaining - _charge) <= 0 THEN 'depleted' ELSE status END,
         updated_at = now()
   WHERE id = _pack_id;

  INSERT INTO public.expert_hour_usages
    (pack_id, user_id, expert_id, expert_name, hours_used, delivery_mode, session_date, note)
  VALUES
    (_pack_id, _user, _expert_id, _expert_name, _charge, _delivery, _session_date, _note);

  RETURN jsonb_build_object(
    'success', true,
    'remaining', _remaining - _charge,
    'charged', _charge,
    'multiplier', _multiplier
  );
END;
$$;
