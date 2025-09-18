-- 검사 결과 저장을 위한 테이블 생성
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_type TEXT NOT NULL,
  test_category TEXT NOT NULL,
  results JSONB NOT NULL,
  analysis TEXT,
  chart_data JSONB,
  test_info JSONB,
  score_summary JSONB,
  risk_level TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 검사 결과만 조회 가능
CREATE POLICY "Users can view their own test results" 
ON public.test_results 
FOR SELECT 
USING (auth.uid() = user_id);

-- 사용자는 자신의 검사 결과만 생성 가능
CREATE POLICY "Users can create their own test results" 
ON public.test_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 검사 결과만 수정 가능
CREATE POLICY "Users can update their own test results" 
ON public.test_results 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 관리자는 모든 검사 결과 조회 가능
CREATE POLICY "Admins can view all test results" 
ON public.test_results 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_test_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_test_results_updated_at
    BEFORE UPDATE ON public.test_results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_test_results_updated_at();