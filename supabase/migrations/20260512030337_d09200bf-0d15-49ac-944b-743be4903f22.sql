-- 1) organizations: 추천 링크용 공개 컬럼
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS is_referral_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS commission_rate numeric(5,4) NOT NULL DEFAULT 0.15;

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug) WHERE slug IS NOT NULL;

-- 2) mind_track_enrollments: 어느 파트너 센터를 통해 들어왔는가
ALTER TABLE public.mind_track_enrollments
  ADD COLUMN IF NOT EXISTS referrer_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referrer_slug text;

CREATE INDEX IF NOT EXISTS idx_mt_enrollments_referrer_org ON public.mind_track_enrollments(referrer_org_id) WHERE referrer_org_id IS NOT NULL;

-- 3) 추천 링크 클릭 추적 테이블
CREATE TABLE IF NOT EXISTS public.partner_referral_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id uuid,
  user_agent text,
  referrer_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prc_slug_created ON public.partner_referral_clicks(slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prc_org_created ON public.partner_referral_clicks(org_id, created_at DESC);

ALTER TABLE public.partner_referral_clicks ENABLE ROW LEVEL SECURITY;

-- INSERT: 누구나 자기 방문 기록 가능 (RPC 통해서만 사용)
CREATE POLICY "anyone can insert referral click"
  ON public.partner_referral_clicks FOR INSERT
  WITH CHECK (true);

-- SELECT: 운영자(admin) 또는 해당 organization 관리자만
CREATE POLICY "admin or org admin can read clicks"
  ON public.partner_referral_clicks FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = partner_referral_clicks.org_id
        AND o.admin_user_id = auth.uid()
    )
  );

-- 4) 슬러그로 파트너 공개 정보 조회 (이름/로고/태그라인/활성 여부만)
CREATE OR REPLACE FUNCTION public.get_partner_org_by_slug(_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  logo_url text,
  tagline text,
  org_type text,
  is_referral_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.name, o.slug, o.logo_url, o.tagline, o.org_type::text, o.is_referral_active
  FROM public.organizations o
  WHERE o.slug = _slug
    AND o.is_active = true
    AND o.is_referral_active = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_partner_org_by_slug(text) TO anon, authenticated;

-- 5) 클릭 기록 RPC (RLS 우회 없이 통제된 입력만 받음)
CREATE OR REPLACE FUNCTION public.track_partner_referral_click(
  _slug text,
  _user_agent text DEFAULT NULL,
  _referrer_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  IF _slug IS NULL OR length(_slug) = 0 OR length(_slug) > 64 THEN
    RETURN;
  END IF;

  SELECT id INTO v_org_id
  FROM public.organizations
  WHERE slug = _slug AND is_active = true AND is_referral_active = true
  LIMIT 1;

  INSERT INTO public.partner_referral_clicks (slug, org_id, user_id, user_agent, referrer_url)
  VALUES (
    _slug,
    v_org_id,
    auth.uid(),
    LEFT(COALESCE(_user_agent, ''), 500),
    LEFT(COALESCE(_referrer_url, ''), 500)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_partner_referral_click(text, text, text) TO anon, authenticated;