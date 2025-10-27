-- 노인/장애인 주간활동 바우처 유형 추가
INSERT INTO voucher_types (
  name,
  description,
  monthly_amount,
  session_limit,
  age_min,
  age_max,
  is_active,
  eligibility_criteria
) VALUES (
  '노인/장애인 주간활동',
  '노인 및 장애인을 위한 주간활동 서비스 바우처',
  220000,
  12,
  18,
  NULL,
  true,
  '{"target": ["노인", "장애인"], "service_type": "주간활동"}'::jsonb
);

-- 어린이집/유치원 바우처 유형 추가
INSERT INTO voucher_types (
  name,
  description,
  monthly_amount,
  session_limit,
  age_min,
  age_max,
  is_active,
  eligibility_criteria
) VALUES (
  '어린이집/유치원',
  '영유아 보육 및 교육 서비스 바우처',
  300000,
  20,
  0,
  7,
  true,
  '{"target": ["영유아"], "service_type": "보육/교육"}'::jsonb
);