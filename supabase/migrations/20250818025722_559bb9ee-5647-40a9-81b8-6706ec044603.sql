-- Create experts table
CREATE TABLE public.experts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  photo_url text,
  credential text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  categories text[] NOT NULL DEFAULT '{}',
  region text NOT NULL CHECK (region IN ('수도권', '지방', '전국')),
  online boolean NOT NULL DEFAULT true,
  price_per_50 integer NOT NULL,
  availability_text text NOT NULL,
  calendly_url text NOT NULL,
  contact_form_url text NOT NULL,
  intro text NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
  visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create consult_requests table
CREATE TABLE public.consult_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  category text NOT NULL,
  region text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('online', 'offline')),
  description text,
  preferred_slots text[] DEFAULT '{}',
  budget_range text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'scheduled', 'completed')),
  matched_expert_ids uuid[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consult_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for experts (public viewing, admin management)
CREATE POLICY "Anyone can view visible experts"
ON public.experts
FOR SELECT
USING (visible = true);

CREATE POLICY "Authenticated users can create consult requests"
ON public.consult_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own consult requests"
ON public.consult_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_experts_updated_at
BEFORE UPDATE ON public.experts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data
INSERT INTO public.experts (name, photo_url, credential, verified, categories, region, online, price_per_50, availability_text, calendly_url, contact_form_url, intro, rating) VALUES
('김지수 언어치료사', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face', '언어재활사 1급, 임상경력 8년', true, ARRAY['언어'], '전국', true, 60000, '평일 9-18시, 주말 10-16시', 'https://calendly.com/example1', 'https://forms.gle/example1', '아동 언어발달 지연, 조음장애, 유창성장애 전문. 놀이를 통한 자연스러운 언어 치료로 아이들의 소통 능력을 향상시킵니다.', 4.8),

('박민준 심리상담사', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face', '임상심리사 1급, ADHD 전문가', true, ARRAY['ADHD','주의집중'], '수도권', true, 70000, '평일 14-20시, 토요일 9-15시', 'https://calendly.com/example2', 'https://forms.gle/example2', '청소년 ADHD 및 주의집중 문제 전문. 인지행동치료와 부모교육을 통해 종합적인 개선을 도모합니다.', 4.9),

('이서연 정서전문가', 'https://images.unsplash.com/photo-1594824804732-ca5d318dfd10?w=400&h=400&fit=crop&crop=face', '정신건강임상심리사, 번아웃 전문', true, ARRAY['정서','회복력'], '전국', true, 80000, '평일 10-19시, 주말 상담 가능', 'https://calendly.com/example3', 'https://forms.gle/example3', '성인 번아웃, 우울, 불안 전문. 회복력 향상과 스트레스 관리를 통해 일상의 균형을 찾아드립니다.', 4.7),

('최동욱 노인전문가', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face', '노인심리상담사, 치매예방 전문가', true, ARRAY['노인인지'], '수도권', false, 90000, '평일 9-17시 (대면 상담만)', 'https://calendly.com/example4', 'https://forms.gle/example4', '경도인지저하, 치매 초기 증상 관리 전문. 가족과 함께하는 인지 강화 프로그램을 제공합니다.', 4.6),

('한소영 가족상담사', 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face', '가족치료전문가, 부부상담사 2급', true, ARRAY['기타'], '전국', true, 90000, '평일 19-22시, 주말 전일', 'https://calendly.com/example5', 'https://forms.gle/example5', '가족 갈등, 부부 관계 개선 전문. 가족 구성원 간의 소통과 이해를 돕는 체계적 접근을 제공합니다.', 4.5);