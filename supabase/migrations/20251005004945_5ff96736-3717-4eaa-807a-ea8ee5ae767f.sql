-- 장호탁 한의사님 프로필 추가
INSERT INTO public.experts (
  full_name,
  professional_title,
  bio,
  profile_image_url,
  specializations,
  consultation_methods,
  years_experience,
  hourly_rate,
  is_verified,
  is_available,
  languages,
  certifications,
  education_background,
  average_rating,
  total_sessions
) VALUES (
  '장호탁',
  '한의사 / 인애한의원 안산점 대표원장',
  '11년간 아동, 청소년, 성인의 심신 건강을 돌보아온 한의사입니다. 대면 상담뿐만 아니라 전화, 방문, 카톡 상담까지 다양한 방법으로 환자분들과 소통합니다. 무료 봉사 상담을 통해 더 많은 분들께 도움을 드리고자 합니다.',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  ARRAY['한방치료', '심신의학', '아동발달', '청소년상담', '성인건강'],
  ARRAY['대면상담', '전화상담', '방문상담', '카톡상담'],
  11,
  0,  -- 무료봉사
  true,
  true,
  ARRAY['한국어'],
  ARRAY['한의사 면허', '인애한의원 안산점 대표원장'],
  ARRAY['한의과대학 졸업', '한의사 면허 취득'],
  5.0,
  0
);