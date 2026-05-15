-- =========================================================
-- Teen Risk Referral System (Wee Class / 청소년상담복지센터 연계 + B2G 집계)
-- =========================================================

-- 1) Directory of public youth-support centers (Wee Class / Wee Center / Youth Counseling)
CREATE TYPE public.wee_center_type AS ENUM ('wee_class', 'wee_center', 'wee_school', 'youth_counseling_1388');

CREATE TABLE public.wee_center_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  center_type public.wee_center_type NOT NULL,
  region_sido TEXT NOT NULL,         -- 시/도 (예: 서울특별시)
  region_sigungu TEXT,               -- 시/군/구
  address TEXT,
  phone TEXT,
  hours TEXT,
  website TEXT,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  source TEXT,                       -- 데이터 출처 (예: data.go.kr)
  source_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wee_center_region ON public.wee_center_directory (region_sido, region_sigungu) WHERE is_active = TRUE;
CREATE INDEX idx_wee_center_type ON public.wee_center_directory (center_type) WHERE is_active = TRUE;

ALTER TABLE public.wee_center_directory ENABLE ROW LEVEL SECURITY;

-- Public read (디렉토리 자체는 공공정보)
CREATE POLICY "Anyone can read wee centers"
ON public.wee_center_directory FOR SELECT TO anon, authenticated
USING (is_active = TRUE);

-- Admin manage
CREATE POLICY "Admins manage wee centers"
ON public.wee_center_directory FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Teen risk referrals (실제 감지 기록)
CREATE TYPE public.teen_risk_level AS ENUM ('moderate', 'high', 'critical');
CREATE TYPE public.teen_referral_status AS ENUM (
  'detected',
  'guardian_consent_pending',
  'guardian_notified',
  'center_contacted',
  'expert_assigned',
  'resolved',
  'dismissed'
);

CREATE TABLE public.teen_risk_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                          -- nullable: 게스트도 가능
  guest_session_id TEXT,                 -- 게스트 식별
  age INTEGER,                           -- 10~19
  age_band TEXT,                         -- '10-12','13-15','16-18','19'
  region_sido TEXT,
  region_sigungu TEXT,

  risk_level public.teen_risk_level NOT NULL,
  trigger_source TEXT NOT NULL,          -- 'assessment_score' | 'free_response_keyword' | 'manual'
  trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
  detected_score NUMERIC,                -- 점수 기반일 때
  assessment_type TEXT,                  -- 'depression','stress','anxiety',...

  matched_centers JSONB NOT NULL DEFAULT '[]'::JSONB,  -- [{id,name,type,phone,distance_km}]
  expert_referral_url TEXT,              -- /expert-hiring?urgent=true (snapshot)

  guardian_consent BOOLEAN NOT NULL DEFAULT FALSE,
  guardian_contact_email TEXT,
  guardian_contact_phone TEXT,
  guardian_token TEXT UNIQUE,            -- 보호자 단건 열람 토큰 (랜덤)
  guardian_notified_at TIMESTAMPTZ,

  status public.teen_referral_status NOT NULL DEFAULT 'detected',
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT teen_referrals_owner_chk CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL),
  CONSTRAINT teen_referrals_age_chk CHECK (age IS NULL OR (age BETWEEN 7 AND 24))
);

CREATE INDEX idx_teen_ref_user ON public.teen_risk_referrals (user_id, created_at DESC);
CREATE INDEX idx_teen_ref_guest ON public.teen_risk_referrals (guest_session_id, created_at DESC);
CREATE INDEX idx_teen_ref_region ON public.teen_risk_referrals (region_sido, region_sigungu, created_at DESC);
CREATE INDEX idx_teen_ref_status ON public.teen_risk_referrals (status, created_at DESC);
CREATE INDEX idx_teen_ref_level ON public.teen_risk_referrals (risk_level, created_at DESC);

ALTER TABLE public.teen_risk_referrals ENABLE ROW LEVEL SECURITY;

-- Owner (logged-in teen)
CREATE POLICY "Users see their own teen referrals"
ON public.teen_risk_referrals FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users insert their own teen referrals"
ON public.teen_risk_referrals FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update their own teen referrals"
ON public.teen_risk_referrals FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Guests: insert only (server-side via edge function ideally; permissive insert for client fallback)
CREATE POLICY "Guests can insert teen referrals"
ON public.teen_risk_referrals FOR INSERT TO anon
WITH CHECK (user_id IS NULL AND guest_session_id IS NOT NULL);

-- Admins: full
CREATE POLICY "Admins manage teen referrals"
ON public.teen_risk_referrals FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3) Audit/event log
CREATE TABLE public.teen_risk_referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.teen_risk_referrals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,            -- 'detected','centers_matched','guardian_notified','center_contacted','expert_assigned','resolved','note'
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  actor_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teen_ref_events_ref ON public.teen_risk_referral_events (referral_id, created_at DESC);

ALTER TABLE public.teen_risk_referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see events of their own referrals"
ON public.teen_risk_referral_events FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.teen_risk_referrals r
  WHERE r.id = referral_id AND r.user_id = auth.uid()
));

CREATE POLICY "Admins see all events"
ON public.teen_risk_referral_events FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Updated-at triggers
CREATE TRIGGER trg_wee_center_updated
BEFORE UPDATE ON public.wee_center_directory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_teen_ref_updated
BEFORE UPDATE ON public.teen_risk_referrals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Aggregation RPC for B2G dashboards (5명 미만 마스킹)
CREATE OR REPLACE FUNCTION public.get_teen_risk_aggregates(
  _since TIMESTAMPTZ DEFAULT (now() - INTERVAL '30 days'),
  _until TIMESTAMPTZ DEFAULT now(),
  _region_sido TEXT DEFAULT NULL
)
RETURNS TABLE (
  region_sido TEXT,
  region_sigungu TEXT,
  age_band TEXT,
  risk_level public.teen_risk_level,
  total_count BIGINT,
  is_masked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this aggregate (B2G/내부)
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  WITH raw AS (
    SELECT
      r.region_sido,
      r.region_sigungu,
      COALESCE(r.age_band, 'unknown') AS age_band,
      r.risk_level,
      COUNT(*)::BIGINT AS c
    FROM public.teen_risk_referrals r
    WHERE r.created_at >= _since
      AND r.created_at <  _until
      AND (_region_sido IS NULL OR r.region_sido = _region_sido)
    GROUP BY 1,2,3,4
  )
  SELECT
    raw.region_sido,
    raw.region_sigungu,
    raw.age_band,
    raw.risk_level,
    CASE WHEN raw.c < 5 THEN 0::BIGINT ELSE raw.c END AS total_count,
    (raw.c < 5) AS is_masked
  FROM raw
  ORDER BY raw.region_sido, raw.region_sigungu, raw.age_band, raw.risk_level;
END;
$$;

REVOKE ALL ON FUNCTION public.get_teen_risk_aggregates(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_teen_risk_aggregates(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO authenticated;

-- 6) Guardian token lookup RPC (보호자 단건 열람)
CREATE OR REPLACE FUNCTION public.get_referral_by_guardian_token(_token TEXT)
RETURNS TABLE (
  id UUID,
  age_band TEXT,
  region_sido TEXT,
  region_sigungu TEXT,
  risk_level public.teen_risk_level,
  matched_centers JSONB,
  expert_referral_url TEXT,
  status public.teen_referral_status,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;
  RETURN QUERY
  SELECT r.id, r.age_band, r.region_sido, r.region_sigungu, r.risk_level,
         r.matched_centers, r.expert_referral_url, r.status, r.created_at
  FROM public.teen_risk_referrals r
  WHERE r.guardian_token = _token
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_referral_by_guardian_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_referral_by_guardian_token(TEXT) TO anon, authenticated;

-- 7) Seed: 핵심 시도 30여개 센터 (1388 + 시도별 Wee센터 대표)
INSERT INTO public.wee_center_directory (name, center_type, region_sido, region_sigungu, phone, hours, website, source) VALUES
('청소년상담복지센터 1388', 'youth_counseling_1388', '전국', NULL, '1388', '24시간', 'https://www.1388.go.kr', 'youth.go.kr'),
('서울특별시교육청 학생정신건강증진센터', 'wee_center', '서울특별시', NULL, '02-3999-505', '평일 09:00-18:00', 'https://www.smhrn.or.kr', 'sen.go.kr'),
('서울학교밖청소년지원센터(꿈드림)', 'youth_counseling_1388', '서울특별시', NULL, '02-2285-1318', '평일 09:00-18:00', 'https://www.kdream.or.kr', 'youth.go.kr'),
('동작관악교육지원청 Wee센터', 'wee_center', '서울특별시', '동작구', '02-810-7711', '평일 09:00-18:00', NULL, 'sen.go.kr'),
('강남서초교육지원청 Wee센터', 'wee_center', '서울특별시', '강남구', '02-3444-7887', '평일 09:00-18:00', NULL, 'sen.go.kr'),
('성북강북교육지원청 Wee센터', 'wee_center', '서울특별시', '성북구', '02-944-6543', '평일 09:00-18:00', NULL, 'sen.go.kr'),
('경기도교육청 Wee센터', 'wee_center', '경기도', NULL, '031-820-0570', '평일 09:00-18:00', NULL, 'goe.go.kr'),
('수원교육지원청 Wee센터', 'wee_center', '경기도', '수원시', '031-231-1318', '평일 09:00-18:00', NULL, 'goe.go.kr'),
('성남교육지원청 Wee센터', 'wee_center', '경기도', '성남시', '031-780-2554', '평일 09:00-18:00', NULL, 'goe.go.kr'),
('고양교육지원청 Wee센터', 'wee_center', '경기도', '고양시', '031-934-9136', '평일 09:00-18:00', NULL, 'goe.go.kr'),
('부산광역시교육청 Wee센터', 'wee_center', '부산광역시', NULL, '051-861-7799', '평일 09:00-18:00', NULL, 'pen.go.kr'),
('해운대교육지원청 Wee센터', 'wee_center', '부산광역시', '해운대구', '051-744-3236', '평일 09:00-18:00', NULL, 'pen.go.kr'),
('대구광역시교육청 Wee센터', 'wee_center', '대구광역시', NULL, '053-231-0691', '평일 09:00-18:00', NULL, 'dge.go.kr'),
('인천광역시교육청 Wee센터', 'wee_center', '인천광역시', NULL, '032-432-7179', '평일 09:00-18:00', NULL, 'ice.go.kr'),
('광주광역시교육청 Wee센터', 'wee_center', '광주광역시', NULL, '062-380-4585', '평일 09:00-18:00', NULL, 'gen.go.kr'),
('대전광역시교육청 Wee센터', 'wee_center', '대전광역시', NULL, '042-480-7878', '평일 09:00-18:00', NULL, 'dje.go.kr'),
('울산광역시교육청 Wee센터', 'wee_center', '울산광역시', NULL, '052-210-5680', '평일 09:00-18:00', NULL, 'use.go.kr'),
('세종특별자치시교육청 Wee센터', 'wee_center', '세종특별자치시', NULL, '044-410-0560', '평일 09:00-18:00', NULL, 'sje.go.kr'),
('강원특별자치도교육청 Wee센터', 'wee_center', '강원특별자치도', NULL, '033-258-1816', '평일 09:00-18:00', NULL, 'gwe.go.kr'),
('충청북도교육청 Wee센터', 'wee_center', '충청북도', NULL, '043-220-5424', '평일 09:00-18:00', NULL, 'cbe.go.kr'),
('충청남도교육청 Wee센터', 'wee_center', '충청남도', NULL, '041-640-7775', '평일 09:00-18:00', NULL, 'cne.go.kr'),
('전북특별자치도교육청 Wee센터', 'wee_center', '전북특별자치도', NULL, '063-239-3315', '평일 09:00-18:00', NULL, 'jbe.go.kr'),
('전라남도교육청 Wee센터', 'wee_center', '전라남도', NULL, '061-260-0410', '평일 09:00-18:00', NULL, 'jne.go.kr'),
('경상북도교육청 Wee센터', 'wee_center', '경상북도', NULL, '054-805-3032', '평일 09:00-18:00', NULL, 'gbe.go.kr'),
('경상남도교육청 Wee센터', 'wee_center', '경상남도', NULL, '055-268-1075', '평일 09:00-18:00', NULL, 'gne.go.kr'),
('제주특별자치도교육청 Wee센터', 'wee_center', '제주특별자치도', NULL, '064-710-0181', '평일 09:00-18:00', NULL, 'jje.go.kr'),
('해밀학교(Wee스쿨)', 'wee_school', '경기도', '용인시', '031-322-2275', '기숙형 위탁교육', NULL, 'goe.go.kr'),
('서울가정형Wee센터', 'wee_center', '서울특별시', NULL, '02-2231-1235', '24시간 (가정형)', NULL, 'sen.go.kr'),
('한국청소년상담복지개발원', 'youth_counseling_1388', '전국', NULL, '1388', '24시간', 'https://www.kyci.or.kr', 'kyci.or.kr');
