-- 기관(Organizations) 테이블 생성
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'hospital', 'school', 'clinic', 'company' 등
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- RLS 활성화
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 기관 관리자만 자신의 기관 조회 가능
CREATE POLICY "Organization admins can view their organization"
ON public.organizations
FOR SELECT
USING (auth.uid() = admin_user_id);

-- 기관 관리자만 자신의 기관 수정 가능
CREATE POLICY "Organization admins can update their organization"
ON public.organizations
FOR UPDATE
USING (auth.uid() = admin_user_id);

-- 기관 멤버(등록된 사용자) 테이블 생성
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_identifier TEXT, -- 기관에서 사용하는 ID (학번, 사번 등)
  name TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(organization_id, user_id)
);

-- RLS 활성화
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 기관 관리자는 자신의 기관 멤버 조회 가능
CREATE POLICY "Organization admins can view their members"
ON public.organization_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations
    WHERE organizations.id = organization_members.organization_id
    AND organizations.admin_user_id = auth.uid()
  )
);

-- 기관 관리자는 자신의 기관에 멤버 추가 가능
CREATE POLICY "Organization admins can insert members"
ON public.organization_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organizations
    WHERE organizations.id = organization_members.organization_id
    AND organizations.admin_user_id = auth.uid()
  )
);

-- 기관 관리자는 자신의 기관 멤버 삭제 가능
CREATE POLICY "Organization admins can delete members"
ON public.organization_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.organizations
    WHERE organizations.id = organization_members.organization_id
    AND organizations.admin_user_id = auth.uid()
  )
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_organizations_admin ON public.organizations(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_organizations_updated_at();