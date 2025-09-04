-- Add 200 tokens to user tntjr91@kakao.com
DO $$
DECLARE
  target_user_id UUID := '1ff30a0d-8b0c-4980-92b7-6cd7f9a254e0';
  token_amount INTEGER := 200;
BEGIN
  -- Add tokens
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens + token_amount,
    total_purchased = total_purchased + token_amount
  WHERE user_id = target_user_id;
  
  -- Add usage tracking record
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (target_user_id, 'admin_bonus', CURRENT_DATE, token_amount)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + token_amount;
END $$;