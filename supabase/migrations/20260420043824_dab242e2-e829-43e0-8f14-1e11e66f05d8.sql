-- 1. 직원-회사 매핑
CREATE TABLE IF NOT EXISTS public.employee_organization_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  institution_id UUID NOT NULL REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE,
  department_code TEXT,
  employee_code TEXT,
  joined_via_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, institution_id)
);

CREATE INDEX IF NOT EXISTS idx_emp_org_user ON public.employee_organization_links(user_id);
CREATE INDEX IF NOT EXISTS idx_emp_org_inst ON public.employee_organization_links(institution_id, is_active);
CREATE INDEX IF NOT EXISTS idx_emp_org_dept ON public.employee_organization_links(institution_id, department_code) WHERE is_active = true;

ALTER TABLE public.employee_organization_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees view own link"
ON public.employee_organization_links FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Employees create own link"
ON public.employee_organization_links FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees update own link"
ON public.employee_organization_links FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Institution owners view their employee links"
ON public.employee_organization_links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions bpi
    WHERE bpi.id = employee_organization_links.institution_id
      AND bpi.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE TRIGGER trg_emp_org_links_updated
BEFORE UPDATE ON public.employee_organization_links
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. 직원 데이터 공유 토글 (옵트인 실명 vs 기본 익명)
CREATE TABLE IF NOT EXISTS public.employee_data_sharing_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  institution_id UUID NOT NULL REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE,
  share_identity BOOLEAN NOT NULL DEFAULT false,
  share_stress_score BOOLEAN NOT NULL DEFAULT true,
  share_burnout_score BOOLEAN NOT NULL DEFAULT true,
  share_turnover_risk BOOLEAN NOT NULL DEFAULT false,
  share_coaching_usage BOOLEAN NOT NULL DEFAULT true,
  allow_crisis_alert BOOLEAN NOT NULL DEFAULT true,
  consent_version TEXT NOT NULL DEFAULT 'v1',
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, institution_id)
);

CREATE INDEX IF NOT EXISTS idx_emp_share_user ON public.employee_data_sharing_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_emp_share_inst ON public.employee_data_sharing_preferences(institution_id);

ALTER TABLE public.employee_data_sharing_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees manage own sharing prefs"
ON public.employee_data_sharing_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Institution owners view sharing prefs"
ON public.employee_data_sharing_preferences FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions bpi
    WHERE bpi.id = employee_data_sharing_preferences.institution_id
      AND bpi.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE TRIGGER trg_emp_share_prefs_updated
BEFORE UPDATE ON public.employee_data_sharing_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. 부서별 집계 (5명 미만 마스킹) - HR 대시보드 전용
CREATE OR REPLACE FUNCTION public.get_department_aggregated_stats(
  p_institution_id UUID,
  p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  department_code TEXT,
  total_employees BIGINT,
  participated_employees BIGINT,
  avg_stress_score NUMERIC,
  avg_burnout_score NUMERIC,
  high_risk_count BIGINT,
  is_masked BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 회사 소유주 또는 관리자만 호출 가능
  IF NOT EXISTS (
    SELECT 1 FROM public.b2b_partner_institutions
    WHERE id = p_institution_id AND user_id = auth.uid()
  ) AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Only institution owner or admin can view aggregated stats';
  END IF;

  RETURN QUERY
  WITH dept_stats AS (
    SELECT
      eol.department_code AS dept,
      COUNT(DISTINCT eol.user_id) AS total,
      COUNT(DISTINCT s.employee_user_id) AS participated,
      AVG(s.stress_score) AS avg_stress,
      AVG(s.burnout_score) AS avg_burnout,
      COUNT(DISTINCT CASE WHEN s.risk_level IN ('high','critical') THEN s.employee_user_id END) AS high_risk
    FROM public.employee_organization_links eol
    LEFT JOIN public.b2b_jobcoach_employee_sessions s
      ON s.employee_user_id = eol.user_id
      AND s.institution_id = eol.institution_id
      AND s.created_at >= now() - (p_period_days || ' days')::INTERVAL
    WHERE eol.institution_id = p_institution_id
      AND eol.is_active = true
    GROUP BY eol.department_code
  )
  SELECT
    ds.dept,
    ds.total,
    ds.participated,
    -- 5명 미만이면 평균 점수 마스킹 (NULL)
    CASE WHEN ds.total < 5 THEN NULL ELSE ROUND(ds.avg_stress, 1) END,
    CASE WHEN ds.total < 5 THEN NULL ELSE ROUND(ds.avg_burnout, 1) END,
    -- 위험군 인원도 마스킹
    CASE WHEN ds.total < 5 THEN NULL ELSE ds.high_risk END,
    (ds.total < 5) AS is_masked
  FROM dept_stats ds
  ORDER BY ds.dept NULLS LAST;
END;
$$;