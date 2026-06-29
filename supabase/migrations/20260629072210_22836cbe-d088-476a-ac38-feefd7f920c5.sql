
-- 1. Groups (classes) per center
CREATE TABLE public.center_client_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (center_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.center_client_groups TO authenticated;
GRANT ALL ON public.center_client_groups TO service_role;
ALTER TABLE public.center_client_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "center members manage groups" ON public.center_client_groups
  FOR ALL TO authenticated
  USING (public.is_center_member(center_id))
  WITH CHECK (public.is_center_member(center_id));

-- 2. Group <-> client memberships (many-to-many)
CREATE TABLE public.center_client_group_members (
  group_id UUID NOT NULL REFERENCES public.center_client_groups(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.center_clients(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by UUID,
  PRIMARY KEY (group_id, client_id)
);
CREATE INDEX idx_ccgm_center_client ON public.center_client_group_members(center_id, client_id);
CREATE INDEX idx_ccgm_group ON public.center_client_group_members(group_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.center_client_group_members TO authenticated;
GRANT ALL ON public.center_client_group_members TO service_role;
ALTER TABLE public.center_client_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "center members manage group members" ON public.center_client_group_members
  FOR ALL TO authenticated
  USING (public.is_center_member(center_id))
  WITH CHECK (public.is_center_member(center_id));

-- 3. Batch send jobs (audit log of bulk parent dispatches)
CREATE TABLE public.center_batch_send_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.center_client_groups(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('therapy_note','parent_report')),
  period_label TEXT,
  total_count INT NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  failure_count INT NOT NULL DEFAULT 0,
  skipped_count INT NOT NULL DEFAULT 0,
  send_sms BOOLEAN NOT NULL DEFAULT false,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cbsj_center_created ON public.center_batch_send_jobs(center_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.center_batch_send_jobs TO authenticated;
GRANT ALL ON public.center_batch_send_jobs TO service_role;
ALTER TABLE public.center_batch_send_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "center members view batch jobs" ON public.center_batch_send_jobs
  FOR SELECT TO authenticated USING (public.is_center_member(center_id));
CREATE POLICY "center members create batch jobs" ON public.center_batch_send_jobs
  FOR INSERT TO authenticated WITH CHECK (public.is_center_member(center_id));
CREATE POLICY "service role full batch jobs" ON public.center_batch_send_jobs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER trg_ccg_updated BEFORE UPDATE ON public.center_client_groups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
