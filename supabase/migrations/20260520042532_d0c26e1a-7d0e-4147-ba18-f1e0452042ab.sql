
-- 1) center_directory: lightweight directory of partner/non-partner centers
CREATE TABLE IF NOT EXISTS public.center_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('dev_center','counseling_center')),
  region text NOT NULL,
  address text,
  specialties text[] NOT NULL DEFAULT '{}',
  phone text,
  intro text,
  is_partner boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_center_directory_region ON public.center_directory(region);
CREATE INDEX IF NOT EXISTS idx_center_directory_type ON public.center_directory(type);

ALTER TABLE public.center_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active centers"
ON public.center_directory FOR SELECT
USING (is_active = true);

-- 2) center_inquiries: user inquiries directed to a center
CREATE TABLE IF NOT EXISTS public.center_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid REFERENCES public.center_directory(id) ON DELETE SET NULL,
  user_id uuid,
  name text NOT NULL,
  contact text NOT NULL,
  child_age text,
  memo text,
  check_summary jsonb,
  source_path text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_center_inquiries_center ON public.center_inquiries(center_id);
CREATE INDEX IF NOT EXISTS idx_center_inquiries_user ON public.center_inquiries(user_id);

ALTER TABLE public.center_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (including guests) can submit an inquiry
CREATE POLICY "Anyone can submit inquiries"
ON public.center_inquiries FOR INSERT
WITH CHECK (true);

-- Owners can view their own inquiries (when logged in)
CREATE POLICY "Owners can view own inquiries"
ON public.center_inquiries FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Admins can view all
CREATE POLICY "Admins can view all inquiries"
ON public.center_inquiries FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inquiries"
ON public.center_inquiries FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 3) Seed 5 dummy centers (서울 강남/서초 등)
INSERT INTO public.center_directory (name, type, region, address, specialties, phone, intro, is_partner, slug) VALUES
('마음숲 발달센터 강남점', 'dev_center', '서울 강남구', '서울 강남구 테헤란로 152', ARRAY['언어','감각통합','ABA'], '02-555-0101', '강남 대치동 인근, 언어·감각통합 통합 프로그램 운영', true, 'maeumsup-gangnam'),
('연결심리상담 서초센터', 'counseling_center', '서울 서초구', '서울 서초구 강남대로 27', ARRAY['아동상담','부모코칭','놀이치료'], '02-555-0202', '아동·부모 동반 코칭 중심의 가족 상담 센터', true, 'yeongyeol-seocho'),
('하늘발달지원센터', 'dev_center', '서울 송파구', '서울 송파구 올림픽로 300', ARRAY['언어','인지','사회성'], '02-555-0303', '취학 전 아동 대상 1:1 맞춤 발달 프로그램', false, 'haneul-songpa'),
('온마음심리상담센터', 'counseling_center', '서울 마포구', '서울 마포구 양화로 45', ARRAY['청소년','우울','불안'], '02-555-0404', '청소년·성인 정서 코칭 전문 상담실', false, 'onmaeum-mapo'),
('자람아동발달센터', 'dev_center', '경기 성남시 분당구', '경기 성남시 분당구 정자일로 95', ARRAY['ABA','언어','놀이'], '031-555-0505', '판교·분당 지역 아동 발달 종합 케어', true, 'jaram-bundang')
ON CONFLICT (slug) DO NOTHING;
