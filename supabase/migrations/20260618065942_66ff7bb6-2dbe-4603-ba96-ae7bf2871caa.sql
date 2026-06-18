
-- 1) 공유 링크 테이블
CREATE TABLE public.center_parent_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  resource_type text NOT NULL CHECK (resource_type IN ('therapy_note','parent_report')),
  resource_id uuid NOT NULL,
  child_id uuid,
  center_id uuid,
  parent_phone_e164 text NOT NULL,
  parent_phone_last4 text NOT NULL,
  created_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  first_verified_at timestamptz,
  last_accessed_at timestamptz,
  access_count integer NOT NULL DEFAULT 0,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  revoked_at timestamptz,
  sms_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cpsl_token ON public.center_parent_share_links(token);
CREATE INDEX idx_cpsl_phone ON public.center_parent_share_links(parent_phone_e164);
CREATE INDEX idx_cpsl_creator ON public.center_parent_share_links(created_by);
CREATE INDEX idx_cpsl_center ON public.center_parent_share_links(center_id);

GRANT SELECT, INSERT, UPDATE ON public.center_parent_share_links TO authenticated;
GRANT ALL ON public.center_parent_share_links TO service_role;

ALTER TABLE public.center_parent_share_links ENABLE ROW LEVEL SECURITY;

-- 치료사: 본인이 만든 링크 조회/생성/수정
CREATE POLICY "Creators can view their share links"
  ON public.center_parent_share_links FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Creators can insert share links"
  ON public.center_parent_share_links FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can update share links"
  ON public.center_parent_share_links FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 2) 부모 전화번호 ↔ 계정 매핑
CREATE TABLE public.parent_phone_links (
  phone_e164 text PRIMARY KEY,
  parent_user_id uuid,
  children_ids uuid[] NOT NULL DEFAULT '{}',
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ppl_user ON public.parent_phone_links(parent_user_id);

GRANT SELECT ON public.parent_phone_links TO authenticated;
GRANT ALL ON public.parent_phone_links TO service_role;

ALTER TABLE public.parent_phone_links ENABLE ROW LEVEL SECURITY;

-- 부모는 본인 매핑만 조회 가능
CREATE POLICY "Parents can view their own phone link"
  ON public.parent_phone_links FOR SELECT
  TO authenticated
  USING (parent_user_id = auth.uid());

-- 3) updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cpsl_updated_at
  BEFORE UPDATE ON public.center_parent_share_links
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TRIGGER trg_ppl_updated_at
  BEFORE UPDATE ON public.parent_phone_links
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) 부모-자녀 매핑 병합 헬퍼 (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.upsert_parent_phone_link(
  _phone text,
  _user_id uuid,
  _child_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.parent_phone_links (phone_e164, parent_user_id, children_ids, last_verified_at)
  VALUES (
    _phone,
    _user_id,
    CASE WHEN _child_id IS NULL THEN '{}'::uuid[] ELSE ARRAY[_child_id] END,
    now()
  )
  ON CONFLICT (phone_e164) DO UPDATE
    SET parent_user_id   = COALESCE(public.parent_phone_links.parent_user_id, EXCLUDED.parent_user_id),
        children_ids     = CASE
          WHEN _child_id IS NULL THEN public.parent_phone_links.children_ids
          WHEN _child_id = ANY(public.parent_phone_links.children_ids) THEN public.parent_phone_links.children_ids
          ELSE public.parent_phone_links.children_ids || _child_id
        END,
        last_verified_at = now(),
        updated_at       = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_parent_phone_link(text, uuid, uuid) TO service_role;
