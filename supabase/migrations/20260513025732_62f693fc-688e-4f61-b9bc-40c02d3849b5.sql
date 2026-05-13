-- Mind Condition Score System (Noom-style single number outcome)

CREATE TABLE public.mind_condition_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  dimensions JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'self_check',
  note TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mcs_user_recorded ON public.mind_condition_scores (user_id, recorded_at DESC);

ALTER TABLE public.mind_condition_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mind scores"
  ON public.mind_condition_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own mind scores"
  ON public.mind_condition_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own mind scores"
  ON public.mind_condition_scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own mind scores"
  ON public.mind_condition_scores FOR DELETE
  USING (auth.uid() = user_id);

-- Aggregate score calculator (best-effort: tolerates absent source tables)
CREATE OR REPLACE FUNCTION public.calculate_mind_condition_score(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_emotion NUMERIC := 70;
  v_sleep NUMERIC := 70;
  v_relation NUMERIC := 70;
  v_focus NUMERIC := 70;
  v_resilience NUMERIC := 70;
  v_score INTEGER;
  v_dimensions JSONB;
BEGIN
  -- Pull most-recent progress_tracking emotion average if present
  BEGIN
    SELECT
      COALESCE(AVG((meta->>'emotion_score')::numeric), 70)
    INTO v_emotion
    FROM public.progress_tracking
    WHERE user_id = p_user_id
      AND created_at > now() - interval '14 days';
  EXCEPTION WHEN OTHERS THEN
    v_emotion := 70;
  END;

  -- Resilience proxy: count of completed activities in last 14 days
  BEGIN
    SELECT LEAST(100, 50 + COUNT(*) * 3)
    INTO v_resilience
    FROM public.progress_tracking
    WHERE user_id = p_user_id
      AND created_at > now() - interval '14 days';
  EXCEPTION WHEN OTHERS THEN
    v_resilience := 70;
  END;

  v_score := GREATEST(0, LEAST(100, ROUND(
    (v_emotion * 0.35) +
    (v_sleep * 0.15) +
    (v_relation * 0.15) +
    (v_focus * 0.15) +
    (v_resilience * 0.20)
  )));

  v_dimensions := jsonb_build_object(
    'emotion', ROUND(v_emotion),
    'sleep', ROUND(v_sleep),
    'relation', ROUND(v_relation),
    'focus', ROUND(v_focus),
    'resilience', ROUND(v_resilience)
  );

  RETURN jsonb_build_object('score', v_score, 'dimensions', v_dimensions);
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_mind_condition_score(UUID) TO authenticated;