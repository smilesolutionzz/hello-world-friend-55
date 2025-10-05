-- Add 문기웅 expert to the experts table
INSERT INTO experts (
  full_name, 
  professional_title, 
  specializations, 
  years_experience, 
  hourly_rate, 
  bio, 
  is_verified, 
  is_available, 
  is_featured,
  featured_order,
  consultation_methods, 
  languages, 
  education_background,
  profile_image_url,
  kakao_link
) VALUES (
  '문기웅',
  '제약회사 부장',
  ARRAY['제약', '약 관련 상담'],
  10,
  0,
  '10년 경력의 제약 전문가입니다. 제약회사 부장으로 재직하며 약 관련 전문 상담을 무료 봉사로 제공합니다.',
  true,
  true,
  true,
  1,
  ARRAY['카카오톡상담'],
  ARRAY['한국어'],
  ARRAY['학사 학위'],
  '/src/assets/expert-moon-giwung.jpg',
  'https://pf.kakao.com/_NxoLxon'
);