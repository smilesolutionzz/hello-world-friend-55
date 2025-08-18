-- 토큰 구독 플랜 가격 업데이트
UPDATE public.token_subscription_plans 
SET price = 29900, yearly_price = 299000 
WHERE name = 'Pro';

UPDATE public.token_subscription_plans 
SET price = 99900, yearly_price = 999000 
WHERE name = 'Premium';