-- Risk level enum
DO $$ BEGIN
  CREATE TYPE public.child_dev_risk_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.child_dev_concern_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  child_age_months INTEGER,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level public.child_dev_risk_level NOT NULL,
  top_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  interpretation TEXT,
  seven_day_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cdcr_user_created
  ON public.child_dev_concern_results (user_id, created_at DESC);

ALTER TABLE public.child_dev_concern_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own dev concern results"
  ON public.child_dev_concern_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own dev concern results"
  ON public.child_dev_concern_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own dev concern results"
  ON public.child_dev_concern_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own dev concern results"
  ON public.child_dev_concern_results FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_cdcr_updated_at
  BEFORE UPDATE ON public.child_dev_concern_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();