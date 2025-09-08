-- Create trigger function for expert application notifications
CREATE OR REPLACE FUNCTION public.create_admin_notification_for_expert_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- 새로운 전문가 신청 시 관리자 알림 생성
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_notifications (
      notification_type,
      title,
      message,
      related_id,
      priority
    ) VALUES (
      'expert_application',
      '새로운 전문가 신청서',
      NEW.full_name || '님이 전문가로 지원했습니다.',
      NEW.id,
      'high'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger for expert applications
CREATE TRIGGER expert_application_notification_trigger
  AFTER INSERT ON public.expert_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_admin_notification_for_expert_application();