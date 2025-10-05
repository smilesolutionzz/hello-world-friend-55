-- Add 허승룡 expert agent
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
  '허승룡',
  ARRAY['언어치료', '부모치료'],
  ARRAY['대면상담', '화상상담', '전화상담', '문자상담', '온라인상담', '가정상담'],
  ARRAY['석사 학위'],
  15,
  50000,
  '/src/assets/expert-heo-seungryong.jpg',
  true,
  true,
  '15년 경력의 언어치료 및 부모치료 전문가입니다. 유아부터 성인까지 다양한 연령대를 대상으로 전문적인 치료를 제공합니다. 대면, 화상, 전화, 문자, 온라인, 가정 상담 등 다양한 방법으로 상담이 가능합니다.',
  '언어치료 및 부모치료 전문가',
  ARRAY['한국어']
);