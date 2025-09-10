-- Add 500 tokens to toss@naver.com
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'toss@naver.com';
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email toss@naver.com not found';
  END IF;
  
  -- Ensure user has a tokens record
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, total_used, referral_bonus, last_daily_bonus_date)
  VALUES (target_user_id, 0, 0, 0, 0, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Add 500 tokens using the admin function
  PERFORM public.admin_add_tokens(target_user_id, 500);
  
  RAISE NOTICE 'Successfully added 500 tokens to toss@naver.com (user_id: %)', target_user_id;
END $$;