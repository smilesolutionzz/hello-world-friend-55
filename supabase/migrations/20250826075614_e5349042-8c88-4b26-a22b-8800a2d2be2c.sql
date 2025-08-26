-- szkei@naver.com 사용자에게 토큰 1000개 지급
UPDATE public.user_tokens 
SET 
  current_tokens = current_tokens + 1000,
  total_purchased = total_purchased + 1000,
  updated_at = now()
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'szkei@naver.com'
  LIMIT 1
);

-- 사용량 추적 기록
INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
SELECT 
  id,
  'admin_token_grant',
  CURRENT_DATE,
  1000
FROM auth.users 
WHERE email = 'szkei@naver.com'
ON CONFLICT (user_id, feature_type, usage_date) 
DO UPDATE SET count = usage_tracking.count + 1000;