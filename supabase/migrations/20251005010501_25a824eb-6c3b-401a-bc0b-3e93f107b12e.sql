-- Add kakao_link column to experts table if not exists
ALTER TABLE public.experts 
ADD COLUMN IF NOT EXISTS kakao_link text;

-- Update existing expert with kakao link
UPDATE public.experts 
SET kakao_link = 'https://open.kakao.com/o/sq57G6Th',
    updated_at = now()
WHERE full_name = '장호탁';

-- Add new expert: 김선길
INSERT INTO public.experts (
  full_name,
  professional_title,
  specializations,
  years_experience,
  bio,
  hourly_rate,
  consultation_methods,
  languages,
  is_available,
  is_verified,
  kakao_link,
  education_background,
  total_sessions,
  average_rating
) VALUES (
  '김선길',
  '틔움통합발달센터 대표 / 틔움사회서비스센터 - 성인장애인주간활동센터 대표 / 특수체육 발달 전문가',
  ARRAY['특수체육', '발달장애', '성인장애인지원', '통합발달'],
  13,
  '박사 학위를 보유한 특수체육 및 발달 전문가로, 13년간 전 연령대의 발달 및 장애인 지원 분야에서 활동하고 있습니다. 틔움통합발달센터와 성인장애인주간활동센터를 운영하며 개인별 맞춤 상담과 프로그램을 제공합니다.',
  50000,
  ARRAY['대면', '방문', '센터내상담'],
  ARRAY['한국어'],
  true,
  true,
  'https://open.kakao.com/o/sq57G6Th',
  ARRAY['박사'],
  0,
  0
);