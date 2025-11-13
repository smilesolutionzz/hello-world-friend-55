-- 부모아동 놀이평가 결과 저장 테이블
CREATE TABLE public.play_assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  age_group TEXT NOT NULL CHECK (age_group IN ('infant', 'child', 'school')),
  child_age INTEGER NOT NULL,
  answers JSONB NOT NULL,
  style TEXT NOT NULL,
  scores JSONB NOT NULL,
  ai_analysis TEXT,
  cognitive_score INTEGER NOT NULL DEFAULT 0,
  emotional_score INTEGER NOT NULL DEFAULT 0,
  social_score INTEGER NOT NULL DEFAULT 0,
  physical_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.play_assessment_results ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 평가 결과만 조회 가능
CREATE POLICY "Users can view their own play assessment results"
ON public.play_assessment_results
FOR SELECT
USING (auth.uid() = user_id);

-- 사용자는 자신의 평가 결과를 생성 가능
CREATE POLICY "Users can create their own play assessment results"
ON public.play_assessment_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 평가 결과를 수정 가능
CREATE POLICY "Users can update their own play assessment results"
ON public.play_assessment_results
FOR UPDATE
USING (auth.uid() = user_id);

-- 사용자는 자신의 평가 결과를 삭제 가능
CREATE POLICY "Users can delete their own play assessment results"
ON public.play_assessment_results
FOR DELETE
USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_play_assessment_results_updated_at
BEFORE UPDATE ON public.play_assessment_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 인덱스 추가
CREATE INDEX idx_play_assessment_results_user_id ON public.play_assessment_results(user_id);
CREATE INDEX idx_play_assessment_results_created_at ON public.play_assessment_results(created_at DESC);