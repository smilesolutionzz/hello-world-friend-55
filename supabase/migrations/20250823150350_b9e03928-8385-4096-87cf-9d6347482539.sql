-- 기존 플랜 삭제 후 월 구독 플랜 추가
DELETE FROM subscription_plans WHERE name IN ('스타터 팩', '프리미엄 팩', '프로 팩');

INSERT INTO subscription_plans (name, description, price, yearly_price, features, type, is_active) VALUES
('스타터 팩', '기본적인 AI 분석을 위한 월간 토큰 팩', 9900, NULL, ARRAY['매월 50개 토큰 지급', 'AI 심리 분석', '기본 상담 기능', '토큰당 ₩198'], 'paid', true),
('프리미엄 팩', '종합적인 AI 분석을 위한 인기 월간 토큰 팩', 24900, NULL, ARRAY['매월 200개 토큰 지급', 'AI 심리 분석', '전문가 매칭', '우선 지원', '토큰당 ₩124'], 'paid', true),
('프로 팩', '전문가용 대용량 월간 토큰 팩', 99000, NULL, ARRAY['매월 1000개 토큰 지급', '무제한 AI 분석', '전문가 우선 매칭', '24/7 지원', '토큰당 ₩99'], 'paid', true);