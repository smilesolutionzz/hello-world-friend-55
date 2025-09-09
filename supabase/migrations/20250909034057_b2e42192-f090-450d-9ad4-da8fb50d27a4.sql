-- tntjr10@kakao.com 계정에 200토큰 추가
UPDATE public.user_tokens 
SET 
  current_tokens = current_tokens + 200,
  total_purchased = total_purchased + 200
WHERE user_id = 'a96f39d6-4811-4a12-8f08-b25598af92ac';

-- 사용량 추적 기록
INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
VALUES ('a96f39d6-4811-4a12-8f08-b25598af92ac', 'admin_bonus', CURRENT_DATE, 200)
ON CONFLICT (user_id, feature_type, usage_date)
DO UPDATE SET count = usage_tracking.count + 200;