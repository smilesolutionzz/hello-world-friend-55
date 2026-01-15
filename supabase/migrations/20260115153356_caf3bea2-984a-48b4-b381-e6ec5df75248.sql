-- AI 분석 피드백 수집 테이블 (파인튜닝 데이터용)
CREATE TABLE public.ai_analysis_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- 분석 정보
  analysis_type TEXT NOT NULL, -- 'stress', 'attachment', 'development', etc.
  input_data JSONB NOT NULL, -- 원본 검사 데이터
  ai_output TEXT NOT NULL, -- AI 분석 결과
  
  -- 피드백
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5점
  feedback_type TEXT, -- 'too_generic', 'inaccurate', 'helpful', 'needs_detail'
  user_comment TEXT, -- 상세 의견
  
  -- 전문가 수정본 (있으면 - 골드 데이터)
  expert_revised TEXT,
  is_expert_validated BOOLEAN DEFAULT false,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT, -- 비로그인 사용자 추적용
  
  -- 파인튜닝 준비 상태
  is_training_ready BOOLEAN DEFAULT false,
  training_exported_at TIMESTAMP WITH TIME ZONE
);

-- RLS 활성화
ALTER TABLE public.ai_analysis_feedback ENABLE ROW LEVEL SECURITY;

-- 누구나 피드백 삽입 가능 (비로그인도)
CREATE POLICY "Anyone can submit feedback"
ON public.ai_analysis_feedback
FOR INSERT
WITH CHECK (true);

-- 본인 피드백만 조회
CREATE POLICY "Users can view own feedback"
ON public.ai_analysis_feedback
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- 인덱스
CREATE INDEX idx_feedback_analysis_type ON public.ai_analysis_feedback(analysis_type);
CREATE INDEX idx_feedback_rating ON public.ai_analysis_feedback(rating);
CREATE INDEX idx_feedback_training_ready ON public.ai_analysis_feedback(is_training_ready);