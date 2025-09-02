-- 나머지 함수들을 모두 찾아서 search_path 설정 완료

-- trigger 함수들 보안 강화
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_expert_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_consultation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_family_members_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_timeline_activities_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_expert_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- 상담 완료시 전문가 통계 업데이트
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.experts 
    SET 
      total_sessions = total_sessions + 1,
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM public.consultations 
        WHERE expert_id = NEW.expert_id AND rating IS NOT NULL
      )
    WHERE id = NEW.expert_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_observation_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log access to observation data for security monitoring
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (auth.uid(), 'observation_access', CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + 1;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_observation_data_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  referral_code_from_signup TEXT;
  existing_phone_user_id UUID;
BEGIN
  -- 디버깅 로그
  RAISE LOG 'handle_new_user called for user: %', NEW.id;
  RAISE LOG 'user metadata: %', NEW.raw_user_meta_data;

  -- 전화번호 중복 체크 (전화번호가 있는 경우에만)
  IF NEW.raw_user_meta_data ->> 'phone' IS NOT NULL AND NEW.raw_user_meta_data ->> 'phone' != '' THEN
    SELECT user_id INTO existing_phone_user_id 
    FROM public.profiles 
    WHERE phone = NEW.raw_user_meta_data ->> 'phone' 
    AND user_id != NEW.id;
    
    IF existing_phone_user_id IS NOT NULL THEN
      RAISE WARNING 'Phone number already exists for user: %', existing_phone_user_id;
      -- 전화번호가 중복인 경우 null로 설정하여 처리
    END IF;
  END IF;

  -- Insert profile with proper error handling
  INSERT INTO public.profiles (user_id, display_name, phone, birth_date)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    CASE 
      WHEN existing_phone_user_id IS NOT NULL THEN NULL
      ELSE NULLIF(NEW.raw_user_meta_data ->> 'phone', '')
    END,
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'birth_date' != '' 
      THEN (NEW.raw_user_meta_data ->> 'birth_date')::DATE
      ELSE NULL 
    END
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert tokens with 15 tokens for new users
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.id, 15, 15, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE LOG 'User tokens inserted for user: % (15 tokens)', NEW.id;

  -- Handle referral code if provided
  referral_code_from_signup := NEW.raw_user_meta_data ->> 'referral_code';
  RAISE LOG 'Referral code from signup: %', referral_code_from_signup;
  
  IF referral_code_from_signup IS NOT NULL AND referral_code_from_signup != '' THEN
    -- Process referral reward (5 additional tokens)
    RAISE LOG 'Processing referral reward for code: %', referral_code_from_signup;
    PERFORM public.process_referral_reward(referral_code_from_signup, NEW.id);
    RAISE LOG 'Referral reward processed';
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_admin_notification_for_feedback()
RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.handle_new_user_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.user_id, 10, 10, CURRENT_DATE);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- 무료 플랜 ID 가져오기
  INSERT INTO public.user_subscriptions (user_id, subscription_type, plan_id)
  SELECT NEW.user_id, 'free', id 
  FROM subscription_plans 
  WHERE type = 'free' 
  LIMIT 1;
  RETURN NEW;
END;
$$;