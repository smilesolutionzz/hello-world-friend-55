
ALTER TABLE public.center_organizations
  ADD COLUMN IF NOT EXISTS is_beta_partner boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS beta_started_at date,
  ADD COLUMN IF NOT EXISTS beta_notes text;

CREATE TABLE IF NOT EXISTS public.beta_retros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.beta_retros TO authenticated;
GRANT ALL ON public.beta_retros TO service_role;

ALTER TABLE public.beta_retros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "primary admin only" ON public.beta_retros;
CREATE POLICY "primary admin only"
  ON public.beta_retros
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_beta_retros_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_beta_retros_updated_at ON public.beta_retros;
CREATE TRIGGER trg_beta_retros_updated_at
  BEFORE UPDATE ON public.beta_retros
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_beta_retros_updated_at();
