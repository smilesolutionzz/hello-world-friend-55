-- 기존 함수들의 search_path 보안 강화
-- Function Search Path Mutable 경고들을 해결

-- 1. has_role 함수 보안 강화 (이미 SET search_path = public이 있지만 재확인)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. make_user_admin 함수 보안 강화
CREATE OR REPLACE FUNCTION public.make_user_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email from auth.users (only works with service role)
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- 3. admin_add_tokens 함수 보안 강화
CREATE OR REPLACE FUNCTION public.admin_add_tokens(target_user_id uuid, token_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- 토큰 추가
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens + token_amount,
    total_purchased = total_purchased + token_amount
  WHERE user_id = target_user_id;
  
  -- 사용량 추적 기록
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (target_user_id, 'admin_bonus', CURRENT_DATE, token_amount)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + token_amount;
  
  RETURN TRUE;
END;
$$;

-- 4. can_access_family_observation 함수 보안 강화
CREATE OR REPLACE FUNCTION public.can_access_family_observation(observation_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    observation_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM public.family_members fm 
      WHERE fm.user_id = auth.uid() 
        AND fm.family_id IN (
          SELECT fm2.family_id 
          FROM public.family_members fm2 
          WHERE fm2.user_id = observation_user_id
        )
    );
$$;