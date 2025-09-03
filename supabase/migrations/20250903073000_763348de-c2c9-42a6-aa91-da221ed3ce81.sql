-- 바우처 타입 테이블
CREATE TABLE public.voucher_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  monthly_amount INTEGER NOT NULL DEFAULT 0,
  session_limit INTEGER NOT NULL DEFAULT 0,
  age_min INTEGER,
  age_max INTEGER,
  eligibility_criteria JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 기관 재가방문 서비스 테이블
CREATE TABLE public.institution_home_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL, -- 'therapy', 'education', 'development', 'counseling'
  target_age_min INTEGER,
  target_age_max INTEGER,
  session_duration INTEGER NOT NULL DEFAULT 50, -- 분 단위
  price_per_session INTEGER NOT NULL DEFAULT 0,
  voucher_types_accepted UUID[] DEFAULT '{}',
  service_area JSONB DEFAULT '[]'::jsonb, -- 서비스 지역
  max_travel_distance INTEGER DEFAULT 30, -- km
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 사용자 바우처 정보 테이블
CREATE TABLE public.user_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  voucher_type_id UUID NOT NULL,
  voucher_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expire_date DATE NOT NULL,
  total_amount INTEGER NOT NULL DEFAULT 0,
  used_amount INTEGER NOT NULL DEFAULT 0,
  remaining_amount INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  used_sessions INTEGER NOT NULL DEFAULT 0,
  remaining_sessions INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'suspended'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 방문 서비스 신청/예약 테이블
CREATE TABLE public.home_service_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  voucher_id UUID,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  child_birth_date DATE,
  preferred_schedule JSONB DEFAULT '[]'::jsonb,
  service_address TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  emergency_contact TEXT,
  special_requests TEXT,
  payment_method TEXT NOT NULL DEFAULT 'voucher', -- 'voucher', 'self_pay', 'mixed'
  estimated_cost INTEGER NOT NULL DEFAULT 0,
  voucher_coverage INTEGER DEFAULT 0,
  self_pay_amount INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 방문 세션 기록 테이블
CREATE TABLE public.home_service_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  actual_duration INTEGER,
  session_notes TEXT,
  voucher_used INTEGER DEFAULT 0,
  self_pay_used INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
  provider_signature TEXT,
  parent_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voucher_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_home_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_service_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- voucher_types (공개 조회 가능)
CREATE POLICY "Voucher types are viewable by everyone" 
ON public.voucher_types 
FOR SELECT 
USING (is_active = true);

-- institution_home_services
CREATE POLICY "Institution services are viewable by everyone" 
ON public.institution_home_services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Institution admins can manage their services" 
ON public.institution_home_services 
FOR ALL 
USING (institution_id IN (
  SELECT id FROM public.institutions WHERE admin_id = auth.uid()
));

-- user_vouchers
CREATE POLICY "Users can view their own vouchers" 
ON public.user_vouchers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vouchers" 
ON public.user_vouchers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vouchers" 
ON public.user_vouchers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- home_service_bookings
CREATE POLICY "Users can view their own bookings" 
ON public.home_service_bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.home_service_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.home_service_bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Institution admins can view bookings for their services" 
ON public.home_service_bookings 
FOR SELECT 
USING (service_id IN (
  SELECT ihs.id FROM public.institution_home_services ihs
  JOIN public.institutions i ON i.id = ihs.institution_id
  WHERE i.admin_id = auth.uid()
));

CREATE POLICY "Institution admins can update bookings for their services" 
ON public.home_service_bookings 
FOR UPDATE 
USING (service_id IN (
  SELECT ihs.id FROM public.institution_home_services ihs
  JOIN public.institutions i ON i.id = ihs.institution_id
  WHERE i.admin_id = auth.uid()
));

-- home_service_sessions
CREATE POLICY "Users can view sessions for their bookings" 
ON public.home_service_sessions 
FOR SELECT 
USING (booking_id IN (
  SELECT id FROM public.home_service_bookings WHERE user_id = auth.uid()
));

CREATE POLICY "Institution admins can manage sessions for their services" 
ON public.home_service_sessions 
FOR ALL 
USING (booking_id IN (
  SELECT hsb.id FROM public.home_service_bookings hsb
  JOIN public.institution_home_services ihs ON ihs.id = hsb.service_id
  JOIN public.institutions i ON i.id = ihs.institution_id
  WHERE i.admin_id = auth.uid()
));

-- 외래키 제약조건
ALTER TABLE public.institution_home_services 
ADD CONSTRAINT fk_institution_home_services_institution 
FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.user_vouchers 
ADD CONSTRAINT fk_user_vouchers_voucher_type 
FOREIGN KEY (voucher_type_id) REFERENCES public.voucher_types(id);

ALTER TABLE public.home_service_bookings 
ADD CONSTRAINT fk_home_service_bookings_service 
FOREIGN KEY (service_id) REFERENCES public.institution_home_services(id);

ALTER TABLE public.home_service_bookings 
ADD CONSTRAINT fk_home_service_bookings_voucher 
FOREIGN KEY (voucher_id) REFERENCES public.user_vouchers(id);

ALTER TABLE public.home_service_sessions 
ADD CONSTRAINT fk_home_service_sessions_booking 
FOREIGN KEY (booking_id) REFERENCES public.home_service_bookings(id) ON DELETE CASCADE;

-- 트리거 생성
CREATE TRIGGER update_institution_home_services_updated_at
BEFORE UPDATE ON public.institution_home_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_vouchers_updated_at
BEFORE UPDATE ON public.user_vouchers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_home_service_bookings_updated_at
BEFORE UPDATE ON public.home_service_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_home_service_sessions_updated_at
BEFORE UPDATE ON public.home_service_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 초기 바우처 타입 데이터 삽입
INSERT INTO public.voucher_types (name, description, monthly_amount, session_limit, age_min, age_max) VALUES
('발달재활서비스', '만 18세 미만 장애아동을 위한 발달재활서비스', 220000, 8, 0, 17),
('언어발달지원서비스', '만 12세 미만 비장애아동 언어발달지원', 160000, 6, 0, 11),
('아동청소년심리지원서비스', '만 18세 이하 심리상담 지원', 200000, 8, 0, 18),
('학습코칭바우처', '초중고 학습코칭 지원', 180000, 6, 6, 18);