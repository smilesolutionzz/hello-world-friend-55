-- 발달 목표 테이블 생성
CREATE TABLE IF NOT EXISTS public.development_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.development_goals ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 목표만 조회
CREATE POLICY "Users can view their own goals" 
ON public.development_goals 
FOR SELECT 
USING (auth.uid() = user_id);

-- 사용자는 자신의 목표만 생성
CREATE POLICY "Users can create their own goals" 
ON public.development_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 목표만 수정
CREATE POLICY "Users can update their own goals" 
ON public.development_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 사용자는 자신의 목표만 삭제
CREATE POLICY "Users can delete their own goals" 
ON public.development_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- 업데이트 시 updated_at 자동 갱신 트리거
CREATE TRIGGER update_development_goals_updated_at
BEFORE UPDATE ON public.development_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 인덱스 추가
CREATE INDEX idx_development_goals_user_id ON public.development_goals(user_id);
CREATE INDEX idx_development_goals_status ON public.development_goals(status);