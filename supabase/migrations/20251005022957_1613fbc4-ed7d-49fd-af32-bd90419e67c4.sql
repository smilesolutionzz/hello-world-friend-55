-- Add 이상록 expert agent
INSERT INTO public.experts (
  full_name,
  specializations,
  consultation_methods,
  education_background,
  years_experience,
  hourly_rate,
  profile_image_url,
  is_verified,
  is_available,
  bio,
  professional_title,
  languages
) VALUES (
  '이상록',
  ARRAY['부모치료', '주식투자치료사'],
  ARRAY['전화상담', '화상상담', '온라인상담', '문자상담', '가정상담'],
  ARRAY['박사 학위'],
  7,
  45000,
  '/src/assets/expert-lee-sangrok.jpg',
  true,
  true,
  '7년 경력의 부모치료 및 주식투자치료 전문가입니다. 초등, 청소년, 성인을 대상으로 전문적인 상담을 제공합니다. 전화, 화상, 온라인, 문자, 가정 상담 등 다양한 방법으로 상담이 가능합니다.',
  '부모치료 및 주식투자치료 전문가',
  ARRAY['한국어']
);

-- Update profile images to male versions
UPDATE public.experts
SET profile_image_url = '/src/assets/expert-lee-suseok-male.jpg'
WHERE full_name = '이수석';

UPDATE public.experts
SET profile_image_url = '/src/assets/expert-song-seongmok-male.jpg'
WHERE full_name = '송성목';

UPDATE public.experts
SET profile_image_url = '/src/assets/expert-heo-seungryong-male.jpg'
WHERE full_name = '허승룡';