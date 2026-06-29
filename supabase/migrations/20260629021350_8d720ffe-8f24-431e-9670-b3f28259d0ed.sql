-- 1) center_organizations 확장
ALTER TABLE public.center_organizations
  ADD COLUMN IF NOT EXISTS landing_slug text,
  ADD COLUMN IF NOT EXISTS landing_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS landing_published boolean NOT NULL DEFAULT false;

-- 슬러그 형식 제약 (소문자/숫자/대시, 3-40자)
ALTER TABLE public.center_organizations
  DROP CONSTRAINT IF EXISTS center_organizations_landing_slug_format;
ALTER TABLE public.center_organizations
  ADD CONSTRAINT center_organizations_landing_slug_format
  CHECK (landing_slug IS NULL OR landing_slug ~ '^[a-z0-9][a-z0-9-]{2,39}$');

CREATE UNIQUE INDEX IF NOT EXISTS center_organizations_landing_slug_unique
  ON public.center_organizations (landing_slug)
  WHERE landing_slug IS NOT NULL;

-- 2) leads.source
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'other';

-- 3) 공개 RPC: 슬러그로 공개된 랜딩 정보 조회
CREATE OR REPLACE FUNCTION public.get_center_landing_by_slug(_slug text)
RETURNS TABLE (
  center_id uuid,
  name text,
  landing_config jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, landing_config
  FROM public.center_organizations
  WHERE landing_slug = lower(trim(_slug))
    AND landing_published = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_center_landing_by_slug(text) TO anon, authenticated;