-- 기관 관리자 확인 함수 생성
CREATE OR REPLACE FUNCTION public.is_institution_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'institution_admin'::app_role
  )
$$;

-- 기관 ID 조회 함수 (user_id로 소속 기관 찾기)
CREATE OR REPLACE FUNCTION public.get_user_institution_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.b2b_partner_institutions
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 기관 관리자 역할 부여 함수 (관리자만 실행 가능)
CREATE OR REPLACE FUNCTION public.assign_institution_admin(target_user_id uuid, institution_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 관리자 권한 확인
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- user_roles에 institution_admin 역할 추가
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'institution_admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- b2b_partner_institutions에 user_id 연결
  UPDATE public.b2b_partner_institutions
  SET user_id = target_user_id
  WHERE id = institution_id;
  
  RETURN TRUE;
END;
$$;