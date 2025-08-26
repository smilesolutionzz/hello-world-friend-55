-- 제휴기관 테이블 생성
CREATE TABLE public.partner_institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  institution_type TEXT NOT NULL, -- 'development_center', 'medical_center', 'counseling_center'
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_voucher_approved BOOLEAN DEFAULT false,
  voucher_types TEXT[], -- ['발달재활서비스', '언어치료', '심리치료'] 등
  business_license TEXT,
  established_year INTEGER,
  total_experts INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  profile_image_url TEXT,
  gallery_images TEXT[],
  operating_hours JSONB, -- {'monday': '09:00-18:00', 'tuesday': '09:00-18:00'} 형태
  services_offered TEXT[],
  specializations TEXT[],
  facilities TEXT[], -- ['개별치료실', '그룹치료실', '놀이치료실'] 등
  parking_available BOOLEAN DEFAULT false,
  accessibility_features TEXT[], -- ['휠체어접근가능', '엘리베이터'] 등
  certification_info JSONB, -- 인증정보
  partnership_status TEXT DEFAULT 'active', -- 'active', 'pending', 'suspended'
  partnership_start_date DATE,
  commission_rate DECIMAL(5, 2), -- 수수료율
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 기관 전문가 연결 테이블
CREATE TABLE public.institution_experts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.partner_institutions(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL,
  position TEXT, -- '원장', '센터장', '치료사'
  employment_type TEXT, -- 'full_time', 'part_time', 'contract'
  specializations TEXT[],
  available_days TEXT[], -- ['monday', 'tuesday']
  available_hours TEXT, -- '09:00-18:00'
  hourly_rate INTEGER,
  years_at_institution INTEGER,
  is_primary_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id, expert_id)
);

-- 기관 리뷰 테이블
CREATE TABLE public.institution_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.partner_institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  visit_date DATE,
  service_type TEXT, -- 받은 서비스 종류
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 기관 운영 통계 테이블
CREATE TABLE public.institution_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.partner_institutions(id) ON DELETE CASCADE,
  month_year DATE NOT NULL, -- '2024-01-01' 형태로 월별 데이터
  total_consultations INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  retention_rate DECIMAL(5, 2),
  average_session_duration INTEGER, -- 분 단위
  popular_services JSONB, -- 인기 서비스 통계
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.partner_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_analytics ENABLE ROW LEVEL SECURITY;

-- 제휴기관 조회 정책 (모든 사용자가 활성 기관 조회 가능)
CREATE POLICY "Active institutions are viewable by everyone"
ON public.partner_institutions
FOR SELECT
USING (partnership_status = 'active');

-- 기관 전문가 조회 정책
CREATE POLICY "Institution experts are viewable by everyone"
ON public.institution_experts
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.partner_institutions 
  WHERE id = institution_experts.institution_id 
  AND partnership_status = 'active'
));

-- 리뷰 조회 정책
CREATE POLICY "Institution reviews are viewable by everyone"
ON public.institution_reviews
FOR SELECT
USING (true);

-- 사용자는 자신의 리뷰만 작성/수정 가능
CREATE POLICY "Users can create their own reviews"
ON public.institution_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.institution_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- 기관 통계는 해당 기관만 조회 가능 (추후 기관 관리자 시스템 구축시 사용)
CREATE POLICY "Institution analytics are private"
ON public.institution_analytics
FOR SELECT
USING (false); -- 현재는 비공개, 추후 기관 관리자 권한 추가시 수정

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_partner_institutions_location ON public.partner_institutions(latitude, longitude);
CREATE INDEX idx_partner_institutions_type ON public.partner_institutions(institution_type);
CREATE INDEX idx_partner_institutions_voucher ON public.partner_institutions(is_voucher_approved);
CREATE INDEX idx_institution_experts_institution ON public.institution_experts(institution_id);
CREATE INDEX idx_institution_reviews_institution ON public.institution_reviews(institution_id);

-- 업데이트 트리거 설정
CREATE TRIGGER update_partner_institutions_updated_at
BEFORE UPDATE ON public.partner_institutions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institution_experts_updated_at
BEFORE UPDATE ON public.institution_experts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institution_reviews_updated_at
BEFORE UPDATE ON public.institution_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();