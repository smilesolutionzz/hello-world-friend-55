-- 🔒 CRITICAL SECURITY FIX PHASE 4: Remove dangerous SECURITY DEFINER functions
-- Keep only essential ones for auth/admin operations

-- Remove SECURITY DEFINER from observation access logging
DROP FUNCTION IF EXISTS public.log_observation_access();

CREATE OR REPLACE FUNCTION public.log_observation_access()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only log if user is authenticated
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
    VALUES (auth.uid(), 'observation_access', CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature_type, usage_date)
    DO UPDATE SET count = usage_tracking.count + 1;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Remove SECURITY DEFINER from observation data consistency
DROP FUNCTION IF EXISTS public.ensure_observation_data_consistency();

CREATE OR REPLACE FUNCTION public.ensure_observation_data_consistency()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Ensure session_name is consistent
  IF NEW.session_name IS NULL AND NEW.analysis_data IS NOT NULL THEN
    NEW.session_name := COALESCE(
      NEW.analysis_data->>'session_name',
      '관찰일지_' || TO_CHAR(NEW.created_at, 'YYYY-MM-DD')
    );
  END IF;
  
  -- Ensure analysis_data has proper structure
  IF NEW.analysis_data IS NOT NULL THEN
    NEW.analysis_data := jsonb_set(
      NEW.analysis_data,
      '{timestamp}',
      to_jsonb(EXTRACT(EPOCH FROM NEW.created_at))
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remove SECURITY DEFINER from admin notification creation
DROP FUNCTION IF EXISTS public.create_admin_notification_for_feedback();

CREATE OR REPLACE FUNCTION public.create_admin_notification_for_feedback()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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