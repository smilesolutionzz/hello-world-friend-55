-- 이기훈 에이전트를 전문가 테이블에 추가
INSERT INTO public.experts (
  full_name,
  professional_title,
  specializations,
  years_experience,
  bio,
  hourly_rate,
  average_rating,
  total_sessions,
  languages,
  consultation_methods,
  is_verified,
  is_available,
  certifications,
  education_background
) VALUES (
  '이기훈',
  '소소쌤언어치료실 기관장',
  ARRAY['특수체육', '행동발달', '언어치료', '인지치료', '발달치료', '출산전후상담', '계획성취'],
  10,
  '특수체육 행동발달 전문가로 모든 발달 관련 상담이 가능합니다. 소소쌤언어치료실 기관장으로서 언어치료, 인지치료, 발달치료, 출산 전후 상담, 계획 성취 등 폭넓은 전문성을 보유하고 있습니다.',
  0,
  5.0,
  0,
  ARRAY['한국어'],
  ARRAY['화상상담', '방문상담', '센터상담'],
  true,
  true,
  ARRAY['소소쌤언어치료실 기관장'],
  ARRAY['언어치료 전문']
);