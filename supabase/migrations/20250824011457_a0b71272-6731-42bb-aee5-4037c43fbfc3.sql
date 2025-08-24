-- 전문가 피드백 요청 테이블 생성
CREATE TABLE public.expert_feedback_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  observation_id UUID REFERENCES public.observation_logs(id) ON DELETE CASCADE,
  request_status TEXT NOT NULL DEFAULT 'pending' CHECK (request_status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority_level TEXT NOT NULL DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
  request_note TEXT,
  admin_notes TEXT,
  expert_report TEXT,
  expert_id UUID,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 활성화
ALTER TABLE public.expert_feedback_requests ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 요청만 볼 수 있음
CREATE POLICY "Users can view their own feedback requests" 
ON public.expert_feedback_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- 사용자는 자신의 요청만 생성 가능
CREATE POLICY "Users can create their own feedback requests" 
ON public.expert_feedback_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 대기중인 요청만 취소 가능
CREATE POLICY "Users can cancel their pending requests" 
ON public.expert_feedback_requests 
FOR UPDATE 
USING (auth.uid() = user_id AND request_status = 'pending')
WITH CHECK (auth.uid() = user_id AND request_status = 'cancelled');

-- 인덱스 생성
CREATE INDEX idx_expert_feedback_requests_user_id ON public.expert_feedback_requests(user_id);
CREATE INDEX idx_expert_feedback_requests_status ON public.expert_feedback_requests(request_status);
CREATE INDEX idx_expert_feedback_requests_priority ON public.expert_feedback_requests(priority_level);
CREATE INDEX idx_expert_feedback_requests_requested_at ON public.expert_feedback_requests(requested_at);

-- 업데이트 트리거 추가
CREATE TRIGGER update_expert_feedback_requests_updated_at
BEFORE UPDATE ON public.expert_feedback_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 알림 테이블 생성 (관리자용)
CREATE TABLE public.admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('expert_feedback_request', 'urgent_request', 'system_alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- 관련 요청 ID
  is_read BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 관리자 알림 인덱스
CREATE INDEX idx_admin_notifications_type ON public.admin_notifications(notification_type);
CREATE INDEX idx_admin_notifications_read ON public.admin_notifications(is_read);
CREATE INDEX idx_admin_notifications_priority ON public.admin_notifications(priority);
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications(created_at);

-- 전문가 피드백 요청 시 관리자 알림 생성 함수
CREATE OR REPLACE FUNCTION create_admin_notification_for_feedback()
RETURNS TRIGGER AS $$
BEGIN
  -- 새로운 전문가 피드백 요청 시 관리자 알림 생성
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_notifications (
      notification_type,
      title,
      message,
      related_id,
      priority
    ) VALUES (
      'expert_feedback_request',
      '새로운 전문가 피드백 요청',
      '사용자가 관찰일지에 대한 전문가 피드백을 요청했습니다.',
      NEW.id,
      NEW.priority_level
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER expert_feedback_notification_trigger
AFTER INSERT ON public.expert_feedback_requests
FOR EACH ROW
EXECUTE FUNCTION create_admin_notification_for_feedback();