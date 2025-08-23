-- 기존 사용자들에게 토큰 레코드 생성
INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, total_used, referral_bonus, last_daily_bonus_date)
SELECT 
  au.id as user_id,
  10 as current_tokens,
  10 as total_purchased, 
  0 as total_used,
  0 as referral_bonus,
  CURRENT_DATE as last_daily_bonus_date
FROM auth.users au
LEFT JOIN public.user_tokens ut ON au.id = ut.user_id
WHERE ut.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;