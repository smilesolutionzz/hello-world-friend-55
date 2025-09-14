-- 하이브리드 모델 1단계를 위한 플랜 업데이트

-- 무료 플랜 업데이트 (월 1회 체험으로 제한)
UPDATE subscription_plans 
SET 
  description = '월 1회 체험으로 서비스를 경험해보세요',
  features = ARRAY['월 1회 심리검사', 'AI 기본 분석', '결과 요약']
WHERE type = 'free';

-- 기존 프리미엄 플랜을 베이직 무제한 플랜으로 변경
UPDATE subscription_plans 
SET 
  name = '베이직 (무제한)',
  price = 19900,
  description = '월정액으로 모든 기능을 무제한 이용하세요',
  features = ARRAY['무제한 심리검사', 'AI 상세 분석', '결과 저장', 'PDF 리포트', '24/7 지원', '전문가 상담 연결']
WHERE type = 'premium';

-- 토큰 패키지 업데이트 (시험용 50토큰팩)
UPDATE token_packages 
SET 
  name = '토큰팩 (시험용)',
  description = '토큰 방식으로 필요한 만큼만 이용하세요',
  price_krw = 9900,
  token_count = 50,
  is_popular = false
WHERE price_krw = 9900;

-- 기존 24,900원 토큰팩 비활성화 (하이브리드 1단계에서는 제외)
UPDATE token_packages 
SET is_active = false 
WHERE price_krw = 24900;

-- 기존 99,000원 토큰팩 비활성화 (하이브리드 1단계에서는 제외)  
UPDATE token_packages 
SET is_active = false 
WHERE price_krw = 99000;