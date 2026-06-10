
CREATE TABLE public.centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  category TEXT,
  intro TEXT,
  strength1 TEXT,
  strength2 TEXT,
  strength3 TEXT,
  contact_channel TEXT,
  external_link TEXT,
  voucher BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.centers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.centers TO authenticated;
GRANT ALL ON public.centers TO service_role;

ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "centers_public_read" ON public.centers FOR SELECT USING (true);
CREATE POLICY "centers_auth_insert" ON public.centers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "centers_auth_update" ON public.centers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "centers_auth_delete" ON public.centers FOR DELETE TO authenticated USING (true);

CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
  parent_name TEXT,
  phone TEXT,
  child_age TEXT,
  concern TEXT,
  status TEXT NOT NULL DEFAULT '신규',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_public_insert" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads_auth_read" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "leads_auth_update" ON public.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "leads_auth_delete" ON public.leads FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_centers_updated_at BEFORE UPDATE ON public.centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
