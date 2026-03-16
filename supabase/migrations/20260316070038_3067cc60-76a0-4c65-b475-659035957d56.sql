
-- 관리자가 특정 유저에게 무료 프리미엄을 부여하는 함수
CREATE OR REPLACE FUNCTION public.grant_premium_access(
  target_user_id UUID,
  duration_days INTEGER DEFAULT 36500,
  reason TEXT DEFAULT '관리자 수동 부여'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 관리자만 실행 가능
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- 기존 active 구독이 있으면 업데이트, 없으면 삽입
  INSERT INTO public.user_subscriptions (
    user_id,
    subscription_type,
    status,
    is_lifetime,
    current_period_start,
    current_period_end,
    payment_method
  ) VALUES (
    target_user_id,
    CASE WHEN duration_days >= 36500 THEN 'lifetime' ELSE 'premium' END,
    'active',
    duration_days >= 36500,
    NOW(),
    NOW() + (duration_days || ' days')::INTERVAL,
    reason
  )
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_type = EXCLUDED.subscription_type,
    status = 'active',
    is_lifetime = EXCLUDED.is_lifetime,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    payment_method = EXCLUDED.payment_method,
    updated_at = NOW()
  WHERE user_subscriptions.user_id = target_user_id;

  RETURN TRUE;
END;
$$;

-- 관리자가 프리미엄 접근 권한을 해제하는 함수
CREATE OR REPLACE FUNCTION public.revoke_premium_access(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  UPDATE public.user_subscriptions
  SET status = 'cancelled', updated_at = NOW()
  WHERE user_id = target_user_id AND status = 'active';

  RETURN TRUE;
END;
$$;
