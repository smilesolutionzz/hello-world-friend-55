
-- 1. 관리자 역할 부여
INSERT INTO public.user_roles (user_id, role)
VALUES ('78301b1d-28e5-4e50-9da5-5539a1bc9227', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. 기존 구독을 lifetime으로 업데이트
UPDATE public.user_subscriptions
SET subscription_type = 'lifetime',
    status = 'active',
    is_lifetime = true,
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '100 years',
    payment_method = '관리자 수동 부여',
    updated_at = NOW()
WHERE user_id = '78301b1d-28e5-4e50-9da5-5539a1bc9227';

-- 3. 기존 이용권을 9999로 업데이트
UPDATE public.user_test_credits
SET credits = 9999
WHERE user_id = '78301b1d-28e5-4e50-9da5-5539a1bc9227';
