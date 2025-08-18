-- 프리미엄 평가 결과 저장을 위한 테이블 생성
CREATE TABLE public.premium_assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_type TEXT NOT NULL,
  results JSONB NOT NULL,
  ai_analysis TEXT,
  assessment_info JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 활성화
ALTER TABLE public.premium_assessment_results ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "Users can view their own assessment results" 
ON public.premium_assessment_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessment results" 
ON public.premium_assessment_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment results" 
ON public.premium_assessment_results 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_premium_assessment_results_updated_at
BEFORE UPDATE ON public.premium_assessment_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();