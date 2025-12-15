-- 무료 체험 사용 여부를 추적하는 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_free_trials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'premium',
  trial_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trial_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_type)
);

-- RLS 활성화
ALTER TABLE public.user_free_trials ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 무료 체험 정보만 볼 수 있음
CREATE POLICY "Users can view their own free trials"
ON public.user_free_trials
FOR SELECT
USING (auth.uid() = user_id);

-- 서비스 역할만 삽입/수정 가능 (edge function에서 처리)
CREATE POLICY "Service role can manage free trials"
ON public.user_free_trials
FOR ALL
USING (true)
WITH CHECK (true);