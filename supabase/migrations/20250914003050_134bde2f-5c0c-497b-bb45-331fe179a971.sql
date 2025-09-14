-- 하이브리드 1단계 모델: 불필요한 플랜들 완전 제거

-- 구독 플랜에서 프리미엄 팩과 프로 팩 비활성화 (24,900원, 99,000원 플랜들)
UPDATE subscription_plans 
SET is_active = false 
WHERE id IN ('6485147c-4c0f-4d36-83a7-7fa083c94c58', 'c1ef4a39-2e63-462d-b08a-b48a295043ab');

-- 스타터 팩 플랜도 구독 쪽에서는 제거 (토큰팩은 별도 테이블에서 관리)
UPDATE subscription_plans 
SET is_active = false 
WHERE id = '4fc8a1a8-fbca-4e6e-87b1-888eed5cb550';

-- 하이브리드 1단계에서는 구독 플랜은 무료와 베이직만 유지
-- 무료: 월 1회 체험
-- 베이직(무제한): 19,900원/월