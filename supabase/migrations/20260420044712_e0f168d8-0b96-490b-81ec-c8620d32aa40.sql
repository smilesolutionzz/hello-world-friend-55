-- ============================================
-- 유아교육기관(어린이집/유치원) 부모상담 솔루션
-- ============================================

-- 1. 기관 마스터 테이블
CREATE TABLE public.kindergarten_institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL,
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('daycare', 'kindergarten', 'mixed')),
  license_number TEXT,
  region TEXT,
  total_children INTEGER DEFAULT 0,
  total_teachers INTEGER DEFAULT 0,
  contact_email TEXT,
  contact_phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kindergarten_institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their kindergarten"
ON public.kindergarten_institutions FOR ALL
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Admins view all kindergartens"
ON public.kindergarten_institutions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. 부모상담 케이스
CREATE TABLE public.kindergarten_consultation_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.kindergarten_institutions(id) ON DELETE CASCADE,
  teacher_user_id UUID NOT NULL,
  child_nickname TEXT NOT NULL,
  child_age_months INTEGER NOT NULL CHECK (child_age_months BETWEEN 12 AND 96),
  child_gender TEXT CHECK (child_gender IN ('M', 'F', 'unspecified')),
  classroom_name TEXT,
  consultation_focus TEXT[],
  scheduled_consultation_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'baseline_sent', 'baseline_done', 'consultation_done', 't30_sent', 't30_done', 't60_sent', 't60_done', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kindergarten_consultation_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution owners view their cases"
ON public.kindergarten_consultation_cases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kindergarten_institutions
    WHERE id = institution_id AND owner_user_id = auth.uid()
  )
);

CREATE POLICY "Teachers manage their own cases"
ON public.kindergarten_consultation_cases FOR ALL
USING (auth.uid() = teacher_user_id)
WITH CHECK (auth.uid() = teacher_user_id);

CREATE POLICY "Admins view all cases"
ON public.kindergarten_consultation_cases FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. 부모 검사 초대 (T0/T30/T60 라운드)
CREATE TABLE public.kindergarten_assessment_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.kindergarten_consultation_cases(id) ON DELETE CASCADE,
  round_label TEXT NOT NULL CHECK (round_label IN ('T0', 'T30', 'T60')),
  invite_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  curated_assessment Jsonb NOT NULL DEFAULT '{}'::jsonb,
  parent_responses Jsonb,
  computed_scores Jsonb,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'completed', 'expired')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kindergarten_assessment_invites ENABLE ROW LEVEL SECURITY;

-- 부모는 토큰으로 익명 접근 (별도 RPC로 처리, 직접 SELECT 차단)
CREATE POLICY "Teachers view their case invites"
ON public.kindergarten_assessment_invites FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kindergarten_consultation_cases
    WHERE id = case_id AND teacher_user_id = auth.uid()
  )
);

CREATE POLICY "Teachers create invites for their cases"
ON public.kindergarten_assessment_invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kindergarten_consultation_cases
    WHERE id = case_id AND teacher_user_id = auth.uid()
  )
);

CREATE POLICY "Institution owners view invites"
ON public.kindergarten_assessment_invites FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kindergarten_consultation_cases c
    JOIN public.kindergarten_institutions i ON c.institution_id = i.id
    WHERE c.id = case_id AND i.owner_user_id = auth.uid()
  )
);

-- 4. 액션 플랜 (라운드별 교사·부모 코멘트 + 개선도)
CREATE TABLE public.kindergarten_action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.kindergarten_consultation_cases(id) ON DELETE CASCADE,
  round_label TEXT NOT NULL CHECK (round_label IN ('T0', 'T30', 'T60')),
  domain_scores Jsonb NOT NULL DEFAULT '{}'::jsonb,
  rci_changes Jsonb,
  teacher_actions Jsonb NOT NULL DEFAULT '[]'::jsonb,
  parent_actions Jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_summary TEXT,
  improvement_status TEXT CHECK (improvement_status IN ('improved', 'stable', 'declined', 'baseline')),
  teacher_pdf_url TEXT,
  parent_pdf_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (case_id, round_label)
);

ALTER TABLE public.kindergarten_action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers view their case action plans"
ON public.kindergarten_action_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kindergarten_consultation_cases
    WHERE id = case_id AND teacher_user_id = auth.uid()
  )
);

CREATE POLICY "Institution owners view action plans"
ON public.kindergarten_action_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kindergarten_consultation_cases c
    JOIN public.kindergarten_institutions i ON c.institution_id = i.id
    WHERE c.id = case_id AND i.owner_user_id = auth.uid()
  )
);

-- 인덱스
CREATE INDEX idx_kg_cases_institution ON public.kindergarten_consultation_cases(institution_id);
CREATE INDEX idx_kg_cases_teacher ON public.kindergarten_consultation_cases(teacher_user_id);
CREATE INDEX idx_kg_invites_case ON public.kindergarten_assessment_invites(case_id);
CREATE INDEX idx_kg_invites_token ON public.kindergarten_assessment_invites(invite_token);
CREATE INDEX idx_kg_action_plans_case ON public.kindergarten_action_plans(case_id);

-- 트리거 (updated_at)
CREATE TRIGGER update_kg_institutions_updated_at
BEFORE UPDATE ON public.kindergarten_institutions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kg_cases_updated_at
BEFORE UPDATE ON public.kindergarten_consultation_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. 부모 익명 토큰 접근용 RPC (RLS 우회, SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_parent_invite_by_token(p_token TEXT)
RETURNS TABLE (
  invite_id UUID,
  case_id UUID,
  round_label TEXT,
  curated_assessment Jsonb,
  child_nickname TEXT,
  child_age_months INTEGER,
  institution_name TEXT,
  status TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    inv.id, inv.case_id, inv.round_label, inv.curated_assessment,
    c.child_nickname, c.child_age_months,
    i.institution_name,
    inv.status, inv.expires_at
  FROM public.kindergarten_assessment_invites inv
  JOIN public.kindergarten_consultation_cases c ON c.id = inv.case_id
  JOIN public.kindergarten_institutions i ON i.id = c.institution_id
  WHERE inv.invite_token = p_token
    AND inv.expires_at > now()
    AND inv.status IN ('sent', 'opened');
END;
$$;

-- 6. 부모 응답 제출 RPC (토큰 검증 + 응답 저장)
CREATE OR REPLACE FUNCTION public.submit_parent_assessment(
  p_token TEXT,
  p_responses Jsonb,
  p_scores Jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite_id UUID;
  v_case_id UUID;
  v_round TEXT;
BEGIN
  SELECT id, case_id, round_label INTO v_invite_id, v_case_id, v_round
  FROM public.kindergarten_assessment_invites
  WHERE invite_token = p_token
    AND expires_at > now()
    AND status IN ('sent', 'opened');

  IF v_invite_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;

  UPDATE public.kindergarten_assessment_invites
  SET parent_responses = p_responses,
      computed_scores = p_scores,
      status = 'completed',
      completed_at = now()
  WHERE id = v_invite_id;

  -- 케이스 상태 업데이트
  UPDATE public.kindergarten_consultation_cases
  SET status = CASE v_round
    WHEN 'T0' THEN 'baseline_done'
    WHEN 'T30' THEN 't30_done'
    WHEN 'T60' THEN 't60_done'
    ELSE status
  END
  WHERE id = v_case_id;

  RETURN v_invite_id;
END;
$$;