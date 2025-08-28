-- 발달특성 선별체크 결과 저장 테이블 생성
CREATE TABLE IF NOT EXISTS public.developmental_screening_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    test_type TEXT NOT NULL DEFAULT 'aih_developmental_screening',
    age_group TEXT NOT NULL,
    raw_scores INTEGER[] NOT NULL,
    total_score INTEGER NOT NULL,
    ai_analysis JSONB,
    risk_level TEXT,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.developmental_screening_results ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "Users can view their own screening results"
ON public.developmental_screening_results
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own screening results"
ON public.developmental_screening_results
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own screening results"
ON public.developmental_screening_results
FOR UPDATE
USING (user_id = auth.uid());

-- Service role 권한 정책
CREATE POLICY "Service role can manage all screening results"
ON public.developmental_screening_results
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 업데이트 트리거
CREATE TRIGGER update_developmental_screening_results_updated_at
BEFORE UPDATE ON public.developmental_screening_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 인덱스 생성
CREATE INDEX idx_developmental_screening_results_user_id 
ON public.developmental_screening_results(user_id);

CREATE INDEX idx_developmental_screening_results_created_at 
ON public.developmental_screening_results(created_at);

CREATE INDEX idx_developmental_screening_results_test_type 
ON public.developmental_screening_results(test_type);

CREATE INDEX idx_developmental_screening_results_risk_level 
ON public.developmental_screening_results(risk_level);