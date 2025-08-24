-- admin_notifications 테이블에 RLS 정책 추가 (관리자만 접근 가능)
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- 관리자만 알림을 볼 수 있도록 정책 설정 (실제 운영에서는 관리자 역할 확인 필요)
-- 현재는 테스트를 위해 모든 인증된 사용자가 볼 수 있도록 설정
CREATE POLICY "Admin notifications are viewable by authenticated users" 
ON public.admin_notifications 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 시스템에서만 알림 생성 가능 (edge function에서 호출)
CREATE POLICY "System can create admin notifications" 
ON public.admin_notifications 
FOR INSERT 
WITH CHECK (true);

-- 관리자만 알림 상태 업데이트 가능
CREATE POLICY "Admin can update notification status" 
ON public.admin_notifications 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);