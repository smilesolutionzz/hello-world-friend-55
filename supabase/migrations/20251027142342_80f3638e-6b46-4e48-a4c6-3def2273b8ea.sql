-- 교육청서비스 바우처 유형 추가
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
  '교육청서비스',
  '교육청 특수교육 지원 서비스 바우처',
  200000,
  16,
  6,
  18,
  true,
  '{"target": ["특수교육대상자"], "service_type": "교육지원"}'::jsonb
);

-- 지역사회서비스 바우처 유형 추가
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
  '지역사회서비스',
  '지역사회 통합 돌봄 서비스 바우처',
  180000,
  12,
  NULL,
  NULL,
  true,
  '{"target": ["지역주민"], "service_type": "사회서비스"}'::jsonb
);