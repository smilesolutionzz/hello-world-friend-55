
-- Drop existing conflicting function first
DROP FUNCTION IF EXISTS public.is_institution_admin(UUID);

-- 1. 고객 데이터 공유 동의 테이블
CREATE TABLE IF NOT EXISTS public.client_data_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE,
  consent_status TEXT NOT NULL DEFAULT 'active',
  shared_data_types TEXT[] NOT NULL DEFAULT '{}',
  consent_note TEXT,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_user_id, institution_id)
);

-- 2. 기관-고객 연결 테이블
CREATE TABLE IF NOT EXISTS public.institution_client_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_id UUID REFERENCES public.client_data_consents(id) ON DELETE SET NULL,
  client_label TEXT,
  internal_notes TEXT,
  treatment_status TEXT DEFAULT 'new',
  assigned_therapist TEXT,
  priority TEXT DEFAULT 'normal',
  tags TEXT[] DEFAULT '{}',
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, client_user_id)
);

-- 3. 데이터 접근 감사 로그
CREATE TABLE IF NOT EXISTS public.institution_data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL,
  data_types_accessed TEXT[] DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 기관용 AI 치료방향 리포트
CREATE TABLE IF NOT EXISTS public.institution_treatment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL DEFAULT 'treatment_direction',
  report_title TEXT NOT NULL,
  report_content TEXT,
  html_content TEXT,
  source_data_summary JSONB DEFAULT '{}',
  ai_model_used TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_data_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_client_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_treatment_reports ENABLE ROW LEVEL SECURITY;

-- RLS for client_data_consents
CREATE POLICY "Clients manage own consents"
ON public.client_data_consents FOR ALL
TO authenticated
USING (auth.uid() = client_user_id)
WITH CHECK (auth.uid() = client_user_id);

CREATE POLICY "Institutions view consents for their institution"
ON public.client_data_consents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions
    WHERE id = institution_id AND user_id = auth.uid()
  )
);

-- RLS for institution_client_links
CREATE POLICY "Institution admins manage client links"
ON public.institution_client_links FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions
    WHERE id = institution_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions
    WHERE id = institution_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Clients view their own links"
ON public.institution_client_links FOR SELECT
TO authenticated
USING (auth.uid() = client_user_id);

-- RLS for access logs
CREATE POLICY "Institution admins view own logs"
ON public.institution_data_access_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions
    WHERE id = institution_id AND user_id = auth.uid()
  )
);

CREATE POLICY "System inserts access logs"
ON public.institution_data_access_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = accessed_by);

-- RLS for treatment reports
CREATE POLICY "Institution admins manage reports"
ON public.institution_treatment_reports FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions
    WHERE id = institution_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions
    WHERE id = institution_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Clients view shared reports"
ON public.institution_treatment_reports FOR SELECT
TO authenticated
USING (
  auth.uid() = client_user_id AND status = 'shared_with_client'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_consents_client ON public.client_data_consents(client_user_id);
CREATE INDEX IF NOT EXISTS idx_client_consents_institution ON public.client_data_consents(institution_id);
CREATE INDEX IF NOT EXISTS idx_client_links_institution ON public.institution_client_links(institution_id);
CREATE INDEX IF NOT EXISTS idx_client_links_client ON public.institution_client_links(client_user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_institution ON public.institution_data_access_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_treatment_reports_institution ON public.institution_treatment_reports(institution_id);
CREATE INDEX IF NOT EXISTS idx_treatment_reports_client ON public.institution_treatment_reports(client_user_id);

-- Triggers
DROP TRIGGER IF EXISTS update_client_consents_updated_at ON public.client_data_consents;
CREATE TRIGGER update_client_consents_updated_at
  BEFORE UPDATE ON public.client_data_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_links_updated_at ON public.institution_client_links;
CREATE TRIGGER update_client_links_updated_at
  BEFORE UPDATE ON public.institution_client_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_treatment_reports_updated_at ON public.institution_treatment_reports;
CREATE TRIGGER update_treatment_reports_updated_at
  BEFORE UPDATE ON public.institution_treatment_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security definer functions
CREATE OR REPLACE FUNCTION public.is_institution_admin(p_institution_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions
    WHERE id = p_institution_id
    AND user_id = auth.uid()
    AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.has_active_consent(p_institution_id UUID, p_client_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_data_consents
    WHERE institution_id = p_institution_id
    AND client_user_id = p_client_user_id
    AND consent_status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;
