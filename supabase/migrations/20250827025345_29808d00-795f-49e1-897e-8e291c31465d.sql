-- 제휴기관 회원 관리를 위한 테이블 생성
CREATE TABLE public.institution_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_admin_id uuid NOT NULL, -- 기관 관리자 ID
  member_user_id uuid NOT NULL, -- 회원의 실제 user_id
  member_name text NOT NULL,
  member_email text,
  member_phone text,
  birth_date date,
  enrollment_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active', -- active, inactive, graduated
  notes text,
  custom_fields jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(institution_admin_id, member_user_id)
);

-- RLS 정책 설정
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;

-- 기관 관리자만 자신의 회원들을 관리할 수 있음
CREATE POLICY "Institution admins can manage their members"
ON public.institution_members
FOR ALL
USING (auth.uid() = institution_admin_id);

-- 업데이트 트리거
CREATE TRIGGER update_institution_members_updated_at
  BEFORE UPDATE ON public.institution_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 제휴기관 정보 테이블
CREATE TABLE public.institutions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL UNIQUE, -- 기관 관리자 user_id
  institution_name text NOT NULL,
  institution_type text NOT NULL, -- school, clinic, center, etc.
  address text,
  phone text,
  email text,
  website text,
  license_number text,
  director_name text,
  established_date date,
  description text,
  logo_url text,
  settings jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins can manage their institution"
ON public.institutions
FOR ALL
USING (auth.uid() = admin_id);

-- 업데이트 트리거
CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();