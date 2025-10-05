-- Add new expert: 오세은 에이전트
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
  '오세은',
  '감각/놀이/상담 재활 전문 치료사',
  ARRAY['감각재활', '놀이재활', '상담재활', '전연령재활'],
  14,
  '14년 경력의 재활 전문 치료사로 감각재활, 놀이재활, 상담재활 분야에서 활동하고 있습니다. 영유아부터 성인까지 전 연령대를 대상으로 맞춤형 재활 프로그램을 제공하며, 개인별 특성에 맞는 치료 계획을 수립합니다.',
  80000,
  ARRAY['대면', '방문', '센터내상담'],
  ARRAY['한국어'],
  true,
  true,
  'https://open.kakao.com/o/sq57G6Th',
  ARRAY['재활치료 전문가'],
  0,
  0
);