-- 새로운 월 구독 플랜 데이터 업데이트
-- 기존 구독 플랜들을 삭제하고 새로운 플랜들로 교체

-- 기존 플랜들 비활성화
UPDATE subscription_plans SET is_active = false;

-- 새로운 월 구독 플랜들 생성
INSERT INTO subscription_plans (name, type, price, description, features, is_active) VALUES
(
  '베이직',
  'free',
  0,
  '기본적인 AI 분석과 관찰일지를 무료로 체험해보세요',
  ARRAY[
    '월 3회 기본 AI 분석',
    '간단한 관찰일지 작성',
    '기본 심리 상태 체크',
    '커뮤니티 이용'
  ],
  true
),
(
  '스탠다드',
  'premium',
  29900,
  '무제한 AI 분석과 전문가 검토 서비스',
  ARRAY[
    '✨ 무제한 AI 분석 (GPT-4 + Claude)',
    '🧠 3AI 동시 분석으로 정확도 3배 향상',
    '📊 상세한 심리 분석 리포트',
    '👥 전문가 1차 검토 (월 2회)',
    '📱 실시간 위기 감지 알림',
    '📈 상세한 트렌드 분석',
    '🎯 개인 맞춤 개선 가이드',
    '💬 우선 커뮤니티 답변',
    '📞 긴급상담 우선 배정'
  ],
  true
),
(
  '프리미엄',
  'premium',
  59900,
  '완전한 AI + 전문가 케어 서비스',
  ARRAY[
    '🚀 스탠다드 모든 기능 포함',
    '👨‍⚕️ 전문가 상담 월 1회 (50분)',
    '🔍 전문가 심층 분석 (월 2회)',
    '⚡ AI 분석 결과 전문가 검증',
    '📋 개인 맞춤 치료 계획 수립',
    '🎯 전담 전문가 배정',
    '📞 24시간 긴급 상담 라인',
    '👨‍👩‍👧‍👦 가족 구성원 분석 (최대 4명)',
    '🎁 매월 심리 케어 가이드북',
    '🏆 VIP 고객 전용 혜택'
  ],
  true
);

-- 전문가 상담 관련 새로운 설정 테이블 생성 (있으면 skip)
CREATE TABLE IF NOT EXISTS consultation_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_type text NOT NULL,
  monthly_consultations integer NOT NULL DEFAULT 0,
  priority_level integer NOT NULL DEFAULT 1, -- 1: 낮음, 2: 보통, 3: 높음
  expert_assignment_type text NOT NULL DEFAULT 'random', -- random, dedicated, priority
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE consultation_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultation limits are viewable by everyone"
ON consultation_limits
FOR SELECT
USING (true);

-- 구독 타입별 상담 제한 설정
INSERT INTO consultation_limits (subscription_type, monthly_consultations, priority_level, expert_assignment_type) VALUES
('free', 0, 1, 'random'),
('premium', 1, 3, 'dedicated'),
('paid', 1, 3, 'dedicated')
ON CONFLICT DO NOTHING;