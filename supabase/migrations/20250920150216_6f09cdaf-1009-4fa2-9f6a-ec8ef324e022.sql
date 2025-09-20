-- 기존 토큰 패키지 업데이트 및 새로운 토큰 패키지 추가
UPDATE token_packages 
SET is_active = false 
WHERE is_active = true;

-- 새로운 토큰 패키지 (50토큰, 9900원)
INSERT INTO token_packages (name, description, token_count, price_krw, is_popular, is_active)
VALUES (
  '토큰팩 50개',
  '필요할 때만 사용하는 토큰팩입니다. 모든 심리테스트를 이용할 수 있습니다.',
  50,
  9900,
  true,
  true
);

-- 베타 기간 설정 업데이트 (무료 플랜 제거)
UPDATE beta_discount_settings 
SET 
  applies_to_free_plan = false,
  description = '토큰으로 체험 후 구독으로 업그레이드! 베타 기간 34% 할인 혜택'
WHERE is_active = true;