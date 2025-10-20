-- 제휴 기관에 새로운 기관 2개 추가
INSERT INTO partner_institutions (
  name,
  institution_type,
  description,
  partnership_status,
  phone,
  email,
  address,
  services_offered,
  specializations,
  profile_image_url,
  website_url,
  partnership_start_date,
  rating,
  review_count
) VALUES 
(
  '디딤돌언어사회성연구소',
  'therapy_center',
  '언어 및 사회성 발달 전문 연구소. 언어치료, 사회성 향상 프로그램, 발달평가를 제공합니다.',
  'active',
  '02-1234-5678',
  'info@didimstone.com',
  '서울특별시 강남구',
  ARRAY['언어치료', '사회성발달', '발달평가', '아동상담'],
  ARRAY['언어치료', '사회성발달', '아동발달'],
  'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400',
  'https://didimstone.com',
  CURRENT_DATE,
  4.8,
  125
),
(
  'APA발달센터',
  'development_center',
  'Applied Psychology and Assessment 발달 전문 센터. ADHD, 자폐스펙트럼, 발달지연 아동을 위한 종합 평가 및 치료 서비스를 제공합니다.',
  'active',
  '02-9876-5432',
  'contact@apacentr.com',
  '서울특별시 서초구',
  ARRAY['발달평가', 'ADHD치료', '자폐스펙트럼', '행동치료', '심리상담'],
  ARRAY['발달평가', 'ADHD', '자폐스펙트럼', '행동치료'],
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
  'https://apacentr.com',
  CURRENT_DATE,
  4.9,
  198
);