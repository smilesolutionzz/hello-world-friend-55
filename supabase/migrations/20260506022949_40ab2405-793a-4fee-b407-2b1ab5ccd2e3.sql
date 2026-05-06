
-- ============ 1. b2b_lead_downloads ============
CREATE TABLE public.b2b_lead_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_key TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_name TEXT,
  company TEXT,
  role TEXT,
  phone TEXT,
  user_agent TEXT,
  ip_address TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  inquiry_id UUID REFERENCES public.b2b_inquiries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_downloads_email ON public.b2b_lead_downloads(email);
CREATE INDEX idx_lead_downloads_asset ON public.b2b_lead_downloads(asset_key);
ALTER TABLE public.b2b_lead_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit lead" ON public.b2b_lead_downloads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admins view leads" ON public.b2b_lead_downloads
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============ 2. b2b_quotes ============
CREATE TABLE public.b2b_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES public.b2b_jobcoach_inquiries(id) ON DELETE SET NULL,
  quote_no TEXT UNIQUE NOT NULL DEFAULT ('Q-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random()*10000)::text, 4, '0')),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  plan_key TEXT NOT NULL,
  plan_name TEXT,
  employee_count INTEGER NOT NULL CHECK (employee_count > 0),
  months INTEGER NOT NULL DEFAULT 12 CHECK (months > 0),
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  vat INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  pdf_url TEXT,
  valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quotes_inquiry ON public.b2b_quotes(inquiry_id);
CREATE INDEX idx_quotes_email ON public.b2b_quotes(contact_email);
ALTER TABLE public.b2b_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage quotes" ON public.b2b_quotes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_b2b_quotes_updated BEFORE UPDATE ON public.b2b_quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 3. b2b_invoices ============
CREATE TABLE public.b2b_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES public.b2b_quotes(id) ON DELETE SET NULL,
  invoice_no TEXT UNIQUE NOT NULL DEFAULT ('INV-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random()*10000)::text, 4, '0')),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  billing_period_start DATE,
  billing_period_end DATE,
  amount INTEGER NOT NULL,
  vat INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','paid','overdue','void')),
  paid_at TIMESTAMPTZ,
  toss_payment_key TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_quote ON public.b2b_invoices(quote_id);
ALTER TABLE public.b2b_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage invoices" ON public.b2b_invoices
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_b2b_invoices_updated BEFORE UPDATE ON public.b2b_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 4. partner institutions: join code & whitelist ============
ALTER TABLE public.b2b_partner_institutions
  ADD COLUMN IF NOT EXISTS join_code TEXT,
  ADD COLUMN IF NOT EXISTS join_code_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_domain_whitelist TEXT[] DEFAULT '{}'::TEXT[];

CREATE UNIQUE INDEX IF NOT EXISTS idx_inst_join_code ON public.b2b_partner_institutions(join_code) WHERE join_code IS NOT NULL;

-- ============ 5. b2b_inquiries: kanban fields ============
ALTER TABLE public.b2b_jobcoach_inquiries
  ADD COLUMN IF NOT EXISTS kanban_status TEXT DEFAULT 'new' CHECK (kanban_status IN ('new','contacted','qualified','quote_sent','won','lost')),
  ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS assigned_admin UUID;

ALTER TABLE public.b2b_inquiries
  ADD COLUMN IF NOT EXISTS kanban_status TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS assigned_admin UUID,
  ADD COLUMN IF NOT EXISTS source TEXT;

-- ============ 6. RPC: institution admin check ============
CREATE OR REPLACE FUNCTION public.is_institution_admin(_user_id UUID, _institution_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions
    WHERE id = _institution_id AND user_id = _user_id
  ) OR public.has_role(_user_id, 'admin');
$$;

-- ============ 7. RPC: generate join code ============
CREATE OR REPLACE FUNCTION public.generate_institution_join_code(_institution_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_code TEXT;
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INT;
BEGIN
  IF NOT public.is_institution_admin(auth.uid(), _institution_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  v_code := '';
  FOR i IN 1..8 LOOP
    v_code := v_code || substr(v_chars, 1 + floor(random()*length(v_chars))::int, 1);
  END LOOP;
  UPDATE public.b2b_partner_institutions
    SET join_code = v_code, join_code_expires_at = now() + INTERVAL '180 days'
    WHERE id = _institution_id;
  RETURN v_code;
END;
$$;

-- ============ 8. RPC: redeem join code ============
CREATE OR REPLACE FUNCTION public.redeem_join_code(_code TEXT, _department TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_inst RECORD;
  v_user UUID := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;

  SELECT id, institution_name, join_code_expires_at
    INTO v_inst FROM public.b2b_partner_institutions
    WHERE join_code = upper(_code) LIMIT 1;

  IF v_inst.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_code');
  END IF;
  IF v_inst.join_code_expires_at IS NOT NULL AND v_inst.join_code_expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'expired_code');
  END IF;

  INSERT INTO public.employee_organization_links (user_id, institution_id, department_code, joined_via_code, is_active)
    VALUES (v_user, v_inst.id, _department, upper(_code), true)
    ON CONFLICT DO NOTHING;

  INSERT INTO public.employee_data_sharing_preferences
    (user_id, institution_id, share_identity, share_stress_score, share_burnout_score, share_turnover_risk, share_coaching_usage, allow_crisis_alert)
    VALUES (v_user, v_inst.id, false, true, true, false, true, true)
    ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'institution_id', v_inst.id, 'institution_name', v_inst.institution_name);
END;
$$;

-- ============ 9. View: dept weekly aggregates ============
CREATE OR REPLACE VIEW public.v_b2b_dept_weekly_aggregates
WITH (security_invoker = true) AS
SELECT
  s.institution_id,
  COALESCE(s.department_code, '미지정') AS department_code,
  date_trunc('week', s.created_at)::date AS week_start,
  COUNT(DISTINCT s.employee_user_id) AS employee_count,
  CASE WHEN COUNT(DISTINCT s.employee_user_id) >= 5 THEN ROUND(AVG(s.stress_score)::numeric, 1) ELSE NULL END AS avg_stress,
  CASE WHEN COUNT(DISTINCT s.employee_user_id) >= 5 THEN ROUND(AVG(s.burnout_score)::numeric, 1) ELSE NULL END AS avg_burnout,
  CASE WHEN COUNT(DISTINCT s.employee_user_id) >= 5 THEN ROUND(AVG(s.satisfaction_score)::numeric, 1) ELSE NULL END AS avg_satisfaction,
  CASE WHEN COUNT(DISTINCT s.employee_user_id) >= 5 THEN COUNT(*) FILTER (WHERE s.risk_level IN ('high','critical')) ELSE NULL END AS at_risk_count,
  COUNT(*) AS session_count,
  COUNT(DISTINCT s.employee_user_id) >= 5 AS is_visible
FROM public.b2b_jobcoach_employee_sessions s
WHERE s.institution_id IS NOT NULL
GROUP BY s.institution_id, COALESCE(s.department_code, '미지정'), date_trunc('week', s.created_at);

-- ============ 10. View: company overview ============
CREATE OR REPLACE VIEW public.v_b2b_company_overview
WITH (security_invoker = true) AS
SELECT
  s.institution_id,
  COUNT(DISTINCT s.employee_user_id) AS total_employees,
  COUNT(*) AS total_sessions,
  ROUND(AVG(s.stress_score)::numeric, 1) AS avg_stress,
  ROUND(AVG(s.burnout_score)::numeric, 1) AS avg_burnout,
  ROUND(AVG(s.satisfaction_score)::numeric, 1) AS avg_satisfaction,
  COUNT(*) FILTER (WHERE s.risk_level IN ('high','critical')) AS at_risk_sessions,
  COUNT(DISTINCT s.employee_user_id) FILTER (WHERE s.risk_level IN ('high','critical')) AS at_risk_employees,
  MAX(s.created_at) AS last_session_at
FROM public.b2b_jobcoach_employee_sessions s
WHERE s.institution_id IS NOT NULL
GROUP BY s.institution_id;

-- ============ 11. Storage buckets ============
INSERT INTO storage.buckets (id, name, public) VALUES ('b2b-resources', 'b2b-resources', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('b2b-quotes', 'b2b-quotes', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "admins read b2b-resources" ON storage.objects
  FOR SELECT USING (bucket_id = 'b2b-resources' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write b2b-resources" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'b2b-resources' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins read b2b-quotes" ON storage.objects
  FOR SELECT USING (bucket_id = 'b2b-quotes' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write b2b-quotes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'b2b-quotes' AND public.has_role(auth.uid(), 'admin'));
