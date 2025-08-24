-- 보안 이슈 해결: search_path 설정
CREATE OR REPLACE FUNCTION create_admin_notification_for_feedback()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;