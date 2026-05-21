
CREATE TABLE IF NOT EXISTS public.mind_track_regen_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  enrollment_id uuid NOT NULL,
  stage text NOT NULL,
  percent integer NOT NULL DEFAULT 0,
  message text,
  theory text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mt_regen_progress_session
  ON public.mind_track_regen_progress (session_id, created_at DESC);

ALTER TABLE public.mind_track_regen_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "regen_progress_select_own" ON public.mind_track_regen_progress;
CREATE POLICY "regen_progress_select_own"
  ON public.mind_track_regen_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
