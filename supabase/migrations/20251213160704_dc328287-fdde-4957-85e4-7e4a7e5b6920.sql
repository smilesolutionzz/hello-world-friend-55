-- 평생이용권 플랜 추가
INSERT INTO subscription_plans (
  name,
  price,
  type,
  description,
  features,
  is_active,
  priority_support,
  yearly_price
) VALUES (
  '평생이용권',
  99000,
  'lifetime',
  '한 번 결제로 평생 무제한 이용',
  ARRAY[
    '🎯 모든 심리검사 무제한 이용',
    '🧠 AI 상담 무제한 이용',
    '📊 프리미엄 기능 전체 해금',
    '🚀 향후 업데이트 무료 제공',
    '🎁 초기 구매자 특별 혜택',
    '👨‍⚕️ 전문가 상담 우선 배정',
    '💎 평생 프리미엄 멤버 혜택'
  ],
  true,
  true,
  NULL
);

-- user_subscriptions 테이블에 is_lifetime 컬럼 추가 (없는 경우)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' 
    AND column_name = 'is_lifetime'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN is_lifetime BOOLEAN DEFAULT FALSE;
  END IF;
END $$;