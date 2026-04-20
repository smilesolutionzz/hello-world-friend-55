-- 1. B2B 잡코치 요금제 카탈로그
CREATE TABLE public.b2b_jobcoach_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL UNIQUE,
  plan_name text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('starter', 'pro', 'enterprise')),
  price_per_employee_monthly integer NOT NULL DEFAULT 0,
  min_employees integer NOT NULL DEFAULT 1,
  max_employees integer,
  free_coaching_per_employee integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_recommended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.b2b_jobcoach_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobcoach plans"
  ON public.b2b_jobcoach_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage jobcoach plans"
  ON public.b2b_jobcoach_plans FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_b2b_jobcoach_plans_updated
  BEFORE UPDATE ON public.b2b_jobcoach_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. 기업 도입 문의
CREATE TABLE public.b2b_jobcoach_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  position text,
  employee_count integer NOT NULL DEFAULT 0,
  industry text,
  interested_tier text,
  message text,
  source text DEFAULT 'b2b_proposal',
  status text NOT NULL DEFAULT 'new',
  admin_note text,
  contacted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.b2b_jobcoach_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit jobcoach inquiry"
  ON public.b2b_jobcoach_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view jobcoach inquiries"
  ON public.b2b_jobcoach_inquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update jobcoach inquiries"
  ON public.b2b_jobcoach_inquiries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_b2b_jobcoach_inquiries_updated
  BEFORE UPDATE ON public.b2b_jobcoach_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. 익명 임직원 세션 로그 (개인 식별 X, 집계용)
CREATE TABLE public.b2b_jobcoach_employee_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.b2b_partner_institutions(id) ON DELETE SET NULL,
  employee_user_id uuid NOT NULL,
  department_code text,
  session_type text NOT NULL CHECK (session_type IN ('screening', 'ai_chat', 'expert_kakao', 'expert_zoom', 'workshop')),
  duration_minutes integer DEFAULT 0,
  burnout_score integer,
  stress_score integer,
  satisfaction_score integer,
  risk_level text CHECK (risk_level IN ('low', 'mid', 'high')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.b2b_jobcoach_employee_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees insert their own session"
  ON public.b2b_jobcoach_employee_sessions FOR INSERT
  WITH CHECK (auth.uid() = employee_user_id);

CREATE POLICY "Employees view their own session"
  ON public.b2b_jobcoach_employee_sessions FOR SELECT
  USING (auth.uid() = employee_user_id);

CREATE POLICY "Institution staff view aggregated sessions"
  ON public.b2b_jobcoach_employee_sessions FOR SELECT
  USING (
    institution_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.b2b_partner_institutions ins
      WHERE ins.id = b2b_jobcoach_employee_sessions.institution_id
        AND ins.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins view all jobcoach sessions"
  ON public.b2b_jobcoach_employee_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_jobcoach_sessions_institution ON public.b2b_jobcoach_employee_sessions(institution_id, created_at DESC);
CREATE INDEX idx_jobcoach_sessions_dept ON public.b2b_jobcoach_employee_sessions(institution_id, department_code);

-- 4. 부서별 월간 리포트
CREATE TABLE public.b2b_jobcoach_team_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE,
  report_month date NOT NULL,
  department_code text,
  total_employees integer DEFAULT 0,
  participated_employees integer DEFAULT 0,
  avg_burnout_score numeric(5,2),
  avg_stress_score numeric(5,2),
  avg_satisfaction_score numeric(5,2),
  high_risk_count integer DEFAULT 0,
  turnover_risk_score numeric(5,2),
  ai_summary text,
  recommendations jsonb DEFAULT '[]'::jsonb,
  generated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(institution_id, report_month, department_code)
);

ALTER TABLE public.b2b_jobcoach_team_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution staff view their team reports"
  ON public.b2b_jobcoach_team_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.b2b_partner_institutions ins
      WHERE ins.id = b2b_jobcoach_team_reports.institution_id
        AND ins.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage all team reports"
  ON public.b2b_jobcoach_team_reports FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_b2b_jobcoach_team_reports_updated
  BEFORE UPDATE ON public.b2b_jobcoach_team_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 시드: 3-tier 플랜
INSERT INTO public.b2b_jobcoach_plans
  (plan_key, plan_name, tier, price_per_employee_monthly, min_employees, max_employees, free_coaching_per_employee, features, description, display_order, is_recommended)
VALUES
  ('starter', 'Starter — AI 조기감지', 'starter', 9900, 30, 200, 1,
   '["AI 정기 번아웃·스트레스 진단 (월 1회)", "익명 1:1 카톡 코칭 (월 1회/인)", "HR 대시보드: 조직 평균 지표", "위험군 자동 알림 (집계 단위)", "월간 요약 리포트 (PDF)"]'::jsonb,
   '중소·스타트업을 위한 가벼운 도입형. EAP보다 60% 저렴.',
   1, false),
  ('pro', 'Pro — AI + 휴먼 코칭', 'pro', 14900, 100, 1000, 2,
   '["Starter 전체 포함", "익명 줌 화상 코칭 (월 1회/인 추가)", "부서별 진단 리포트 (월간)", "검증된 임상 전문가 50+ 풀", "이직 위험도 예측 모델", "위기 상황 24시간 긴급 대응", "API 연동 (Slack/Teams 알림)"]'::jsonb,
   '중견기업 표준. 부서별 인사이트 + 휴먼 코칭으로 이직률 30% 감소 목표.',
   2, true),
  ('enterprise', 'Enterprise — 전사 전략', 'enterprise', 0, 500, NULL, 4,
   '["Pro 전체 포함", "전담 CSM (Customer Success Manager) 배정", "맞춤 워크숍·세미나 (분기별)", "조직 문화 진단·컨설팅 리포트", "C-Level 임원 1:1 코칭 트랙", "ISO 27001 보안·SLA 99.9%", "온프레미스 옵션", "정부 지원사업 컨설팅 동반"]'::jsonb,
   '대기업·공공기관용 맞춤 견적. 정부 정신건강 지원사업 연계 가능.',
   3, false);