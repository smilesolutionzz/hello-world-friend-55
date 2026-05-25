
CREATE TABLE public.center_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  business_no TEXT,
  phone TEXT,
  address TEXT,
  contract_expires_at DATE,
  plan TEXT NOT NULL DEFAULT 'trial',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE public.center_role AS ENUM ('owner','admin','therapist','viewer');

CREATE TABLE public.center_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.center_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (center_id, user_id)
);
CREATE INDEX idx_center_members_user ON public.center_members(user_id);
CREATE INDEX idx_center_members_center ON public.center_members(center_id);

CREATE TABLE public.center_therapists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  specialty TEXT,
  birth_date DATE,
  phone TEXT,
  work_phone TEXT,
  login_account TEXT,
  calendar_color TEXT DEFAULT '#94a3b8',
  account_status TEXT NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_center_therapists_center ON public.center_therapists(center_id);

CREATE TABLE public.center_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  duration_min INT NOT NULL DEFAULT 45,
  price_krw INT NOT NULL DEFAULT 0,
  is_voucher BOOLEAN NOT NULL DEFAULT false,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_center_programs_center ON public.center_programs(center_id);

CREATE TABLE public.center_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender TEXT,
  birth_date DATE,
  phone TEXT,
  guardian_phone TEXT,
  address TEXT,
  disability_info TEXT,
  initial_consult_date DATE,
  status TEXT NOT NULL DEFAULT 'waiting',
  member_no TEXT,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_center_clients_center ON public.center_clients(center_id);
CREATE INDEX idx_center_clients_status ON public.center_clients(center_id, status);

CREATE TABLE public.center_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.center_clients(id) ON DELETE CASCADE,
  voucher_type TEXT NOT NULL,
  voucher_no TEXT,
  valid_from DATE,
  valid_until DATE,
  monthly_amount INT,
  copayment INT,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_center_vouchers_client ON public.center_vouchers(client_id);

CREATE TYPE public.center_session_status AS ENUM
  ('scheduled','completed','cancelled','cancelled_carry','cancelled_makeup');

CREATE TABLE public.center_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.center_clients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.center_therapists(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.center_programs(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_min INT,
  status public.center_session_status NOT NULL DEFAULT 'scheduled',
  is_voucher BOOLEAN NOT NULL DEFAULT false,
  price_krw INT NOT NULL DEFAULT 0,
  note TEXT,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_center_sessions_center_date ON public.center_sessions(center_id, session_date);
CREATE INDEX idx_center_sessions_client ON public.center_sessions(client_id);
CREATE INDEX idx_center_sessions_therapist ON public.center_sessions(therapist_id);

CREATE TABLE public.center_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.center_clients(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.center_sessions(id) ON DELETE SET NULL,
  paid_at DATE NOT NULL,
  amount_krw INT NOT NULL DEFAULT 0,
  voucher_amount INT NOT NULL DEFAULT 0,
  copayment INT NOT NULL DEFAULT 0,
  method TEXT,
  receipt_no TEXT,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_center_payments_center_date ON public.center_payments(center_id, paid_at);

CREATE TABLE public.center_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.center_payments(id) ON DELETE CASCADE,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.center_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.center_clients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.center_therapists(id) ON DELETE SET NULL,
  assessment_date DATE NOT NULL,
  assessment_type TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  content TEXT,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_center_assessments_client ON public.center_assessments(client_id);

CREATE TABLE public.center_support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  user_id UUID,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.center_notifications_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  template TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued',
  sent_at TIMESTAMPTZ
);

CREATE TABLE public.center_import_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  detected_format TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  summary JSONB NOT NULL DEFAULT '{}',
  error_log JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.center_parent_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.center_clients(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  html_content TEXT,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.has_center_role(_center_id UUID, _roles public.center_role[])
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.center_members
    WHERE center_id = _center_id AND user_id = auth.uid() AND role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_center_member(_center_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.center_members WHERE center_id = _center_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.center_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_center_orgs_updated BEFORE UPDATE ON public.center_organizations
  FOR EACH ROW EXECUTE FUNCTION public.center_touch_updated_at();
CREATE TRIGGER trg_center_clients_updated BEFORE UPDATE ON public.center_clients
  FOR EACH ROW EXECUTE FUNCTION public.center_touch_updated_at();
CREATE TRIGGER trg_center_therapists_updated BEFORE UPDATE ON public.center_therapists
  FOR EACH ROW EXECUTE FUNCTION public.center_touch_updated_at();
CREATE TRIGGER trg_center_sessions_updated BEFORE UPDATE ON public.center_sessions
  FOR EACH ROW EXECUTE FUNCTION public.center_touch_updated_at();

CREATE OR REPLACE FUNCTION public.center_create_owner_membership()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.center_members(center_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_center_org_owner_membership AFTER INSERT ON public.center_organizations
  FOR EACH ROW EXECUTE FUNCTION public.center_create_owner_membership();

ALTER TABLE public.center_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_parent_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_members" ON public.center_organizations
  FOR SELECT TO authenticated USING (public.is_center_member(id));
CREATE POLICY "org_insert_self_owner" ON public.center_organizations
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "org_update_owner_admin" ON public.center_organizations
  FOR UPDATE TO authenticated
  USING (public.has_center_role(id, ARRAY['owner','admin']::public.center_role[]));
CREATE POLICY "org_delete_owner" ON public.center_organizations
  FOR DELETE TO authenticated
  USING (public.has_center_role(id, ARRAY['owner']::public.center_role[]));

CREATE POLICY "members_select_self_or_admin" ON public.center_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_center_role(center_id, ARRAY['owner','admin']::public.center_role[]));
CREATE POLICY "members_admin_write" ON public.center_members
  FOR ALL TO authenticated
  USING (public.has_center_role(center_id, ARRAY['owner','admin']::public.center_role[]))
  WITH CHECK (public.has_center_role(center_id, ARRAY['owner','admin']::public.center_role[]));

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'center_therapists','center_programs','center_clients','center_vouchers',
    'center_sessions','center_payments','center_receipts','center_assessments',
    'center_support_tickets','center_notifications_log','center_import_jobs','center_parent_reports'
  ] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_center_member(center_id));', t || '_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.has_center_role(center_id, ARRAY[''owner'',''admin'',''therapist'']::public.center_role[]));', t || '_insert', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.has_center_role(center_id, ARRAY[''owner'',''admin'',''therapist'']::public.center_role[]));', t || '_update', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.has_center_role(center_id, ARRAY[''owner'',''admin'']::public.center_role[]));', t || '_delete', t);
  END LOOP;
END $$;
