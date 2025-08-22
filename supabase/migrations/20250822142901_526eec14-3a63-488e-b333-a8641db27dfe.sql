-- Create observation templates table
CREATE TABLE public.observation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('basic', 'detailed')),
  duration TEXT NOT NULL,
  cost TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  suitable_for TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.observation_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Templates are viewable by everyone" 
ON public.observation_templates 
FOR SELECT 
USING (is_active = true);

-- Insert mock template data
INSERT INTO public.observation_templates (name, description, template_type, duration, cost, features, items, suitable_for, sort_order) VALUES
(
  '기본 관찰 템플릿',
  '일상적인 관찰에 최적화된 간편한 템플릿',
  'basic',
  '10-15분',
  '3토큰',
  '["빠른 작성", "즉시 AI 분석", "기본 리포트", "간단한 권고사항"]'::jsonb,
  '["정서", "행동", "인지", "사회성", "신체"]'::jsonb,
  '일상적인 모니터링, 처음 사용자',
  1
),
(
  '상세 분석 템플릿',
  '전문가급 심층 분석을 위한 포괄적 템플릿',
  'detailed',
  '25-30분',
  '7토큰',
  '["심층 AI 분석", "전문가 PDF 리포트", "발달 단계 평가", "맞춤형 개입 전략", "데이터 시각화"]'::jsonb,
  '["정서", "행동", "인지", "사회성", "신체", "언어발달", "자기조절능력"]'::jsonb,
  '전문적인 분석이 필요한 경우, 지속적인 모니터링',
  2
);

-- Create trigger for updated_at
CREATE TRIGGER update_observation_templates_updated_at
  BEFORE UPDATE ON public.observation_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create observation domains table for categorization
CREATE TABLE public.observation_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  color_class TEXT NOT NULL DEFAULT 'bg-gray-500',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.observation_domains ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Domains are viewable by everyone" 
ON public.observation_domains 
FOR SELECT 
USING (is_active = true);

-- Insert domain data
INSERT INTO public.observation_domains (name, display_name, description, color_class, sort_order) VALUES
('general', '일반 관찰', '기본적인 관찰 세션', 'bg-blue-500', 1),
('behavioral', '행동 분석', '행동 패턴 중심 관찰', 'bg-green-500', 2),
('emotional', '정서 평가', '감정 상태 중심 관찰', 'bg-purple-500', 3),
('cognitive', '인지 발달', '학습과 사고 과정 관찰', 'bg-orange-500', 4),
('social', '사회성', '대인관계와 소통 관찰', 'bg-pink-500', 5),
('physical', '신체 발달', '운동 능력과 신체 발달 관찰', 'bg-red-500', 6),
('language', '언어 발달', '언어 사용과 소통 능력 관찰', 'bg-teal-500', 7),
('daycare', '어린이집', '어린이집 환경에서의 관찰', 'bg-indigo-500', 8);