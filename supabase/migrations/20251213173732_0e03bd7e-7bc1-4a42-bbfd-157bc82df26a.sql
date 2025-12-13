-- B2B 광고 기관 테이블 (발달센터, 심리상담센터, 한의원 등)
CREATE TABLE public.b2b_partner_institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('development_center', 'counseling_center', 'oriental_medicine', 'hospital', 'academy', 'other')),
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  specializations TEXT[] DEFAULT '{}',
  operating_hours JSONB,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 광고 상품 플랜 (배너, 추천리스트, 프리미엄 프로필)
CREATE TABLE public.b2b_ad_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('banner', 'recommendation', 'premium_profile')),
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER,
  features JSONB DEFAULT '[]',
  display_priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 기관 광고 구독 (어떤 기관이 어떤 플랜을 구독 중인지)
CREATE TABLE public.b2b_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.b2b_ad_plans(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 배너 광고 (위치, 이미지, 링크)
CREATE TABLE public.b2b_banner_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.b2b_subscriptions(id) ON DELETE CASCADE,
  banner_image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL CHECK (position IN ('home_top', 'home_bottom', 'assessment_result', 'sidebar', 'popup')),
  title TEXT,
  description TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 광고 클릭/노출 트래킹
CREATE TABLE public.b2b_ad_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE NOT NULL,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'recommendation', 'profile_view')),
  ad_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'conversion')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_location TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- B2B 문의 테이블 (광고 문의)
CREATE TABLE public.b2b_ad_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  interested_plans TEXT[] DEFAULT '{}',
  budget_range TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'negotiating', 'closed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 기본 광고 플랜 데이터 삽입
INSERT INTO public.b2b_ad_plans (plan_name, plan_type, description, price_monthly, price_yearly, features, display_priority) VALUES
('베이직 배너', 'banner', '홈페이지 하단 배너 광고 노출', 100000, 1000000, '["홈 하단 배너 노출", "월 최대 10,000 노출", "기본 통계 제공"]', 1),
('프리미엄 배너', 'banner', '홈페이지 상단 및 검사결과 페이지 배너', 300000, 3000000, '["홈 상단 + 검사결과 배너", "월 최대 50,000 노출", "상세 분석 리포트", "A/B 테스트 지원"]', 2),
('추천 리스트 베이직', 'recommendation', '검사 결과 페이지에서 추천 기관으로 노출', 200000, 2000000, '["검사결과 추천 목록 노출", "클릭당 과금 옵션", "지역 타겟팅"]', 1),
('추천 리스트 프리미엄', 'recommendation', '우선순위 추천 + 상세 프로필 노출', 500000, 5000000, '["최상단 추천 노출", "상세 기관 소개", "리뷰 노출", "예약 연동"]', 2),
('프리미엄 프로필 베이직', 'premium_profile', '기관 상세 프로필 페이지 개설', 150000, 1500000, '["전용 프로필 페이지", "사진 갤러리", "서비스 소개", "연락처 노출"]', 1),
('프리미엄 프로필 플러스', 'premium_profile', '프리미엄 프로필 + 우선 노출 + 예약 기능', 400000, 4000000, '["전용 프로필 페이지", "검색 우선순위", "온라인 예약 연동", "리뷰 관리", "통계 대시보드"]', 2);

-- RLS 활성화
ALTER TABLE public.b2b_partner_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_ad_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_banner_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_ad_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_ad_inquiries ENABLE ROW LEVEL SECURITY;

-- 광고 플랜은 누구나 조회 가능
CREATE POLICY "Anyone can view active ad plans" ON public.b2b_ad_plans
  FOR SELECT USING (is_active = true);

-- 파트너 기관 정보는 활성화된 것만 공개
CREATE POLICY "Anyone can view active partner institutions" ON public.b2b_partner_institutions
  FOR SELECT USING (is_active = true AND is_verified = true);

-- 기관 소유자는 자신의 기관 정보 관리 가능
CREATE POLICY "Institution owners can manage their institutions" ON public.b2b_partner_institutions
  FOR ALL USING (auth.uid() = user_id);

-- 배너 광고는 활성화된 것만 공개
CREATE POLICY "Anyone can view active banner ads" ON public.b2b_banner_ads
  FOR SELECT USING (is_active = true);

-- 관리자는 모든 데이터 접근 가능
CREATE POLICY "Admins can manage all partner institutions" ON public.b2b_partner_institutions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all ad plans" ON public.b2b_ad_plans
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all subscriptions" ON public.b2b_subscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all banner ads" ON public.b2b_banner_ads
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all analytics" ON public.b2b_ad_analytics
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all inquiries" ON public.b2b_ad_inquiries
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 누구나 광고 문의 제출 가능
CREATE POLICY "Anyone can submit ad inquiries" ON public.b2b_ad_inquiries
  FOR INSERT WITH CHECK (true);

-- 광고 분석 데이터 삽입은 공개 (트래킹용)
CREATE POLICY "Anyone can insert ad analytics" ON public.b2b_ad_analytics
  FOR INSERT WITH CHECK (true);

-- 업데이트 트리거
CREATE TRIGGER update_b2b_institutions_updated_at
  BEFORE UPDATE ON public.b2b_partner_institutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_b2b_subscriptions_updated_at
  BEFORE UPDATE ON public.b2b_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_b2b_inquiries_updated_at
  BEFORE UPDATE ON public.b2b_ad_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();