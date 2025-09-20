-- 테스트 타입 업데이트: 재미테스트만 무료로 설정
UPDATE test_types SET 
  name = '재미테스트',
  description = '무료로 이용 가능한 재미있는 심리테스트'
WHERE name LIKE '%재미%' OR name LIKE '%fun%';

-- 기존 테스트들을 모두 유료(구독 필요)로 설정
-- 새로운 테스트 접근 제어 테이블 생성
CREATE TABLE IF NOT EXISTS test_access_control (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type text NOT NULL UNIQUE,
  access_level text NOT NULL DEFAULT 'premium', -- free, premium, paid
  is_free boolean NOT NULL DEFAULT false,
  required_subscription_type text DEFAULT 'premium',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE test_access_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Test access control is viewable by everyone"
ON test_access_control
FOR SELECT
USING (true);

-- 테스트 접근 제어 데이터 삽입
INSERT INTO test_access_control (test_type, access_level, is_free, required_subscription_type) VALUES
('재미테스트', 'free', true, null),
('ADHD테스트', 'premium', false, 'premium'),
('우울증테스트', 'premium', false, 'premium'),
('불안장애테스트', 'premium', false, 'premium'),
('성격테스트', 'premium', false, 'premium'),
('애착유형테스트', 'premium', false, 'premium'),
('공황장애테스트', 'premium', false, 'premium'),
('한방체질분석', 'premium', false, 'premium'),
('빅파이브테스트', 'premium', false, 'premium'),
('프리미엄테스트', 'premium', false, 'premium')
ON CONFLICT (test_type) DO UPDATE SET
  access_level = EXCLUDED.access_level,
  is_free = EXCLUDED.is_free,
  required_subscription_type = EXCLUDED.required_subscription_type,
  updated_at = now();

-- 베타 할인 기간 설정 테이블 생성
CREATE TABLE IF NOT EXISTS beta_discount_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_name text NOT NULL,
  monthly_discount_percent integer NOT NULL DEFAULT 30,
  yearly_discount_percent integer NOT NULL DEFAULT 50,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL DEFAULT (now() + INTERVAL '3 months'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE beta_discount_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beta discount settings are viewable by everyone"
ON beta_discount_settings
FOR SELECT
USING (true);

-- 베타 할인 설정 삽입
INSERT INTO beta_discount_settings (discount_name, monthly_discount_percent, yearly_discount_percent, start_date, end_date) VALUES
('베타 런칭 특가', 30, 50, now(), now() + INTERVAL '3 months');

-- 구독 플랜 가격 업데이트 (할인 적용)
UPDATE subscription_plans SET 
  price = CASE 
    WHEN name = '스탠다드' THEN 20930  -- 29,900원의 30% 할인
    WHEN name = '프리미엄' THEN 41930  -- 59,900원의 30% 할인
    ELSE price
  END,
  yearly_price = CASE 
    WHEN name = '스탠다드' THEN 179400 -- 월 14,950원 (50% 할인)
    WHEN name = '프리미엄' THEN 359400 -- 월 29,950원 (50% 할인)
    ELSE yearly_price
  END,
  features = CASE 
    WHEN name = '베이직' THEN ARRAY[
      '🎯 재미테스트 무료 이용',
      '📝 기본 관찰일지 작성',
      '💬 커뮤니티 이용',
      '📊 기본 결과 요약'
    ]
    WHEN name = '스탠다드' THEN ARRAY[
      '✨ 모든 심리테스트 무제한',
      '🧠 3AI 동시 분석 (GPT-4 + Claude)',
      '📊 상세한 심리 분석 리포트',
      '👥 전문가 1차 검토 (월 2회)',
      '📱 실시간 위기 감지 알림',
      '📈 상세한 트렌드 분석',
      '🎯 개인 맞춤 개선 가이드',
      '💬 우선 커뮤니티 답변',
      '📞 긴급상담 우선 배정',
      '🎁 베타 기간 30% 할인'
    ]
    WHEN name = '프리미엄' THEN ARRAY[
      '🚀 스탠다드 모든 기능 포함',
      '👨‍⚕️ 전문가 상담 월 1회 (50분)',
      '🔍 전문가 심층 분석 (월 2회)',
      '⚡ AI 분석 결과 전문가 검증',
      '📋 개인 맞춤 치료 계획 수립',
      '🎯 전담 전문가 배정',
      '📞 24시간 긴급 상담 라인',
      '👨‍👩‍👧‍👦 가족 구성원 분석 (최대 4명)',
      '🎁 매월 심리 케어 가이드북',
      '🏆 VIP 고객 전용 혜택',
      '💎 베타 기간 30% 할인'
    ]
    ELSE features
  END
WHERE name IN ('베이직', '스탠다드', '프리미엄');