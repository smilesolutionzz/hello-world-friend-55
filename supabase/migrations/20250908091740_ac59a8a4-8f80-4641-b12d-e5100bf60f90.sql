-- Update admin_notifications table to allow expert_application notification type
ALTER TABLE public.admin_notifications 
DROP CONSTRAINT admin_notifications_notification_type_check;

ALTER TABLE public.admin_notifications 
ADD CONSTRAINT admin_notifications_notification_type_check 
CHECK (notification_type = ANY (ARRAY['expert_feedback_request'::text, 'urgent_request'::text, 'system_alert'::text, 'expert_application'::text]));