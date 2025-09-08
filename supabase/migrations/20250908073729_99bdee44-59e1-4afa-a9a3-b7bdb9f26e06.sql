-- 한점미소발달센터 남양주점 추가 (admin_id 제외)
INSERT INTO public.partner_institutions (
  id,
  name,
  institution_type,
  address,
  phone,
  email,
  description,
  partnership_status,
  specializations,
  services_offered,
  facilities,
  parking_available,
  accessibility_features,
  profile_image_url
) VALUES (
  'e8b5c4d2-9f3a-4b8c-8e7d-1a2b3c4d5e6f'::uuid,
  '한점미소발달센터 남양주점',
  '발달센터',
  '경기도 남양주시 다산중앙로 지하 136, 지하1층 (다산동)',
  '031-567-8901',
  'hanjeom.namyangju@example.com',
  '개별 맞춤형 발달재활서비스와 교육청 연계 방문치료를 제공하는 전문 발달센터입니다. 언어치료, 작업치료, 행동치료 등 종합적인 재활서비스를 통해 아동의 건강한 발달을 지원합니다.',
  'active',
  ARRAY['언어치료', '작업치료', '행동치료', '발달재활', '교육청서비스'],
  ARRAY['발달재활서비스', '방문치료', '개별치료', '그룹치료', '부모상담'],
  ARRAY['개별치료실', '그룹치료실', '감각통합실', '언어치료실', '작업치료실', '대기실'],
  true,
  ARRAY['휠체어 접근 가능', '엘리베이터', '장애인 화장실'],
  '/lovable-uploads/ec886850-04ce-4489-b96e-d4ac8f73d95e.png'
);

-- 발달재활서비스 방문치료 추가
INSERT INTO public.institution_home_services (
  id,
  institution_id,
  service_name,
  service_type,
  description,
  duration_minutes,
  base_price,
  voucher_applicable,
  age_groups,
  specializations,
  requirements,
  service_areas,
  availability_schedule,
  is_active
) VALUES (
  gen_random_uuid(),
  'e8b5c4d2-9f3a-4b8c-8e7d-1a2b3c4d5e6f'::uuid,
  '발달재활서비스 방문치료',
  '발달재활',
  '장애아동의 기능향상과 행동발달을 위한 전문적인 방문 치료 서비스입니다. 언어치료, 작업치료, 행동치료 등을 가정에서 받을 수 있습니다.',
  50,
  80000,
  true,
  ARRAY['영유아', '아동', '청소년'],
  ARRAY['언어치료', '작업치료', '행동치료', '감각통합치료'],
  ARRAY['발달재활서비스 바우처 보유', '보호자 동반 필수', '치료 공간 확보'],
  ARRAY['남양주시', '구리시', '하남시'],
  jsonb_build_object(
    'monday', jsonb_build_array(jsonb_build_object('start', '09:00', 'end', '18:00')),
    'tuesday', jsonb_build_array(jsonb_build_object('start', '09:00', 'end', '18:00')),
    'wednesday', jsonb_build_array(jsonb_build_object('start', '09:00', 'end', '18:00')),
    'thursday', jsonb_build_array(jsonb_build_object('start', '09:00', 'end', '18:00')),
    'friday', jsonb_build_array(jsonb_build_object('start', '09:00', 'end', '18:00')),
    'saturday', jsonb_build_array(jsonb_build_object('start', '09:00', 'end', '15:00'))
  ),
  true
);

-- 교육청서비스 방문치료 추가
INSERT INTO public.institution_home_services (
  id,
  institution_id,
  service_name,
  service_type,
  description,
  duration_minutes,
  base_price,
  voucher_applicable,
  age_groups,
  specializations,
  requirements,
  service_areas,
  availability_schedule,
  is_active
) VALUES (
  gen_random_uuid(),
  'e8b5c4d2-9f3a-4b8c-8e7d-1a2b3c4d5e6f'::uuid,
  '교육청서비스 방문치료',
  '교육지원',
  '교육청 연계 특수교육지원서비스로 학령기 아동의 학습 및 발달을 지원하는 전문 방문치료입니다. 개별교육계획(IEP)에 따른 맞춤형 서비스를 제공합니다.',
  40,
  0,
  true,
  ARRAY['학령기아동', '청소년'],
  ARRAY['특수교육', '학습지원', '행동중재', '사회성훈련'],
  ARRAY['교육청 서비스 신청 완료', '개별교육계획(IEP) 수립', '학교 연계 동의'],
  ARRAY['남양주시', '구리시'],
  jsonb_build_object(
    'monday', jsonb_build_array(jsonb_build_object('start', '15:00', 'end', '19:00')),
    'tuesday', jsonb_build_array(jsonb_build_object('start', '15:00', 'end', '19:00')),
    'wednesday', jsonb_build_array(jsonb_build_object('start', '15:00', 'end', '19:00')),
    'thursday', jsonb_build_array(jsonb_build_object('start', '15:00', 'end', '19:00')),
    'friday', jsonb_build_array(jsonb_build_object('start', '15:00', 'end', '19:00'))
  ),
  true
);