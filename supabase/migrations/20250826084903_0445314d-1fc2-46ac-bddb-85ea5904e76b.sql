-- IEP(개별교육계획) 관련 테이블 생성
CREATE TABLE public.individual_education_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  student_age INTEGER NOT NULL,
  assessment_results JSONB NOT NULL DEFAULT '{}',
  current_performance JSONB NOT NULL DEFAULT '{}',
  annual_goals JSONB NOT NULL DEFAULT '[]',
  short_term_objectives JSONB NOT NULL DEFAULT '[]',
  special_education_services JSONB NOT NULL DEFAULT '[]',
  related_services JSONB NOT NULL DEFAULT '[]',
  supplementary_aids JSONB NOT NULL DEFAULT '[]',
  assessment_modifications JSONB NOT NULL DEFAULT '[]',
  transition_services JSONB,
  plan_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_from DATE,
  valid_to DATE
);

-- 발달 추적 데이터 테이블
CREATE TABLE public.developmental_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  student_id UUID, -- family_members 테이블과 연결
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  domain TEXT NOT NULL, -- 'motor', 'language', 'social', 'cognitive', 'adaptive'
  skill_area TEXT NOT NULL,
  current_level INTEGER NOT NULL CHECK (current_level >= 1 AND current_level <= 5),
  target_level INTEGER CHECK (target_level >= 1 AND target_level <= 5),
  notes TEXT,
  evidence_files JSONB DEFAULT '[]',
  assessor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.individual_education_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developmental_tracking ENABLE ROW LEVEL SECURITY;

-- IEP 정책
CREATE POLICY "Users can manage their own IEPs" 
ON public.individual_education_plans 
FOR ALL 
USING (auth.uid() = user_id);

-- 발달 추적 정책
CREATE POLICY "Users can manage their own developmental tracking" 
ON public.developmental_tracking 
FOR ALL 
USING (auth.uid() = user_id);

-- 업데이트 트리거
CREATE TRIGGER update_iep_updated_at
  BEFORE UPDATE ON public.individual_education_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_developmental_tracking_updated_at
  BEFORE UPDATE ON public.developmental_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();