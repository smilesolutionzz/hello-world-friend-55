-- Add 6 new experts
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
  total_sessions,
  average_rating
) VALUES 
-- 허순한
(
  '허순한',
  '전문 치료사',
  ARRAY['언어재활', '발달재활', '인지재활', '전연령대상'],
  15,
  '15년 경력의 언어재활, 발달재활, 인지재활 전문 치료사입니다. 영유아부터 성인까지 전 연령대를 대상으로 맞춤형 치료를 제공합니다.',
  50000,
  ARRAY['대면', '방문'],
  ARRAY['한국어'],
  true,
  true,
  'https://open.kakao.com/o/sq57G6Th',
  0,
  0
),
-- 송세영
(
  '송세영',
  '전문 치료사',
  ARRAY['발달재활', '대근육', '소근육', '인지', '놀이내상담', '심리내상담'],
  11,
  '11년 경력의 발달재활 전문가로 대근육, 소근육, 인지 발달과 놀이/심리 상담을 통합적으로 제공합니다.',
  100000,
  ARRAY['방문'],
  ARRAY['한국어'],
  true,
  true,
  'https://open.kakao.com/o/sq57G6Th',
  0,
  0
),
-- 예수여
(
  '예수여',
  '전문 치료사',
  ARRAY['독수재활상담사'],
  14,
  '14년 경력의 독수재활 전문 상담사로 다양한 연령대의 상담과 재활을 제공합니다.',
  49600,
  ARRAY['독수재활상담사'],
  ARRAY['한국어'],
  true,
  true,
  'https://open.kakao.com/o/sq57G6Th',
  0,
  0
),
-- 박원묵
(
  '박원묵',
  '전문 치료사',
  ARRAY['독수재활상담사'],
  2,
  '2년 경력의 독수재활 전문 상담사입니다. 젊은 감각으로 맞춤 상담을 제공합니다.',
  0,
  ARRAY['독수재활상담사'],
  ARRAY['한국어'],
  true,
  true,
  'https://open.kakao.com/o/sq57G6Th',
  0,
  0
),
-- 여맥진
(
  '여맥진',
  '전문 치료사',
  ARRAY['미술치료', '상담치료', '성리내상담'],
  5,
  '5년 경력의 미술치료 및 상담치료 전문가로 성인 대상 심리 상담을 제공합니다.',
  50000,
  ARRAY['미술치료', '상담치료'],
  ARRAY['한국어'],
  true,
  true,
  'https://open.kakao.com/o/sq57G6Th',
  0,
  0
),
-- 예원묵
(
  '예원묵',
  '전문 치료사',
  ARRAY['발달재활', '독수재활상담사', '언어', '놀이', '심리미상담', '미술', '성리내상담'],
  7,
  '7년 경력의 종합 재활 전문가로 발달, 언어, 놀이, 심리, 미술 등 다양한 재활 치료를 제공합니다.',
  45000,
  ARRAY['발달재활', '독수재활상담사'],
  ARRAY['한국어'],
  true,
  true,
  'https://open.kakao.com/o/sq57G6Th',
  0,
  0
);