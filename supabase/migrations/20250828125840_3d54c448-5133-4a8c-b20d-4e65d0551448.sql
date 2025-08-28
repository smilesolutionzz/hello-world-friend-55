-- 사용자 후기/피드백 테이블 생성
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_type TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  emoji TEXT DEFAULT '😊',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 후기만 작성/수정 가능
CREATE POLICY "Users can insert their own feedback"
ON public.user_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
ON public.user_feedback
FOR UPDATE
USING (auth.uid() = user_id);

-- 공개 후기는 모든 사용자가 조회 가능
CREATE POLICY "Public feedback is viewable by everyone"
ON public.user_feedback
FOR SELECT
USING (is_public = true);

-- 사용자는 자신의 모든 후기 조회 가능
CREATE POLICY "Users can view their own feedback"
ON public.user_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- 업데이트 트리거 추가
CREATE TRIGGER update_user_feedback_updated_at
BEFORE UPDATE ON public.user_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 실시간 업데이트를 위한 설정
ALTER TABLE public.user_feedback REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_feedback;