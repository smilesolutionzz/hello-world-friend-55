-- Create therapy_institutions table for social service provider search
CREATE TABLE public.therapy_institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  quality_grade TEXT CHECK (quality_grade IN ('A', 'B', 'C', 'D', 'F', '현장평가 비대상기관', '평가 거부기관', '평가 제외기관', '평가 비대상기관', '-')),
  sido TEXT NOT NULL,
  sigungu TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website_url TEXT,
  staff_count INTEGER DEFAULT 0,
  user_count INTEGER DEFAULT 0,
  service_type TEXT,
  rating DECIMAL(3,2),
  is_public BOOLEAN DEFAULT true,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  detailed_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.therapy_institutions ENABLE ROW LEVEL SECURITY;

-- Create policies for therapy institutions
CREATE POLICY "Therapy institutions are viewable by everyone" 
ON public.therapy_institutions 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Admins can manage therapy institutions" 
ON public.therapy_institutions 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better search performance
CREATE INDEX idx_therapy_institutions_business_type ON public.therapy_institutions(business_type);
CREATE INDEX idx_therapy_institutions_sido ON public.therapy_institutions(sido);
CREATE INDEX idx_therapy_institutions_sigungu ON public.therapy_institutions(sigungu);
CREATE INDEX idx_therapy_institutions_quality_grade ON public.therapy_institutions(quality_grade);
CREATE INDEX idx_therapy_institutions_name ON public.therapy_institutions USING gin(to_tsvector('korean', institution_name));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_therapy_institutions_updated_at
BEFORE UPDATE ON public.therapy_institutions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data based on business types from the website
INSERT INTO public.therapy_institutions (institution_name, business_type, sido, sigungu, quality_grade, staff_count, user_count, rating) VALUES
('서울장애인종합복지관', '장애인활동지원사업', '서울특별시', '강남구', 'A', 25, 150, 4.8),
('부산발달장애센터', '발달재활서비스', '부산광역시', '해운대구', 'B', 18, 95, 4.5),
('대구언어치료센터', '언어발달지원사업', '대구광역시', '수성구', 'A', 12, 80, 4.7),
('인천가족지원센터', '산모신생아건강관리지원', '인천광역시', '연수구', 'B', 15, 120, 4.3),
('광주발달센터', '발달장애인 주간활동서비스', '광주광역시', '서구', 'C', 20, 60, 4.2),
('대전돌봄센터', '가사간병방문지원사업', '대전광역시', '유성구', 'A', 30, 200, 4.6),
('울산치료교육원', '지역사회서비스투자', '울산광역시', '남구', 'B', 22, 110, 4.4),
('경기도발달장애지원센터', '발달장애학생 방과후활동서비스', '경기도', '수원시', 'A', 35, 180, 4.8),
('강원특별자치도언어센터', '언어발달지원사업', '강원특별자치도', '춘천시', 'B', 16, 90, 4.3),
('충북장애인복지관', '긴급돌봄지원', '충청북도', '청주시', 'C', 14, 70, 4.1);