-- 🔒 SECURITY FIX: Review and secure SECURITY DEFINER functions
-- Keep necessary functions but add proper access controls

-- 1. Add proper RLS policy for admin_overview_view access
ALTER VIEW public.admin_overview_view SET (security_barrier = true);

-- Add RLS policy for admin_overview_view
CREATE POLICY "Only admins can view admin overview" 
ON public.admin_overview_view 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Review and document legitimate SECURITY DEFINER functions
-- These functions need SECURITY DEFINER for legitimate reasons:
-- - admin_add_tokens: Needs elevated privileges to add tokens
-- - handle_new_user: Trigger function needs to bypass RLS for user creation
-- - process_referral_reward: Needs to update multiple tables atomically
-- - add_daily_tokens: System function for daily bonuses
-- - generate_referral_code: Needs to check uniqueness across all codes

-- Add additional security checks to critical functions
-- Update admin_add_tokens to include additional admin check
CREATE OR REPLACE FUNCTION public.admin_add_tokens(target_user_id uuid, token_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Additional security: Only allow if caller is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Validate input
  IF token_amount <= 0 OR token_amount > 10000 THEN
    RAISE EXCEPTION 'Invalid token amount: Must be between 1 and 10000';
  END IF;
  
  -- 토큰 추가
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens + token_amount,
    total_purchased = total_purchased + token_amount
  WHERE user_id = target_user_id;
  
  -- 사용량 추적 기록
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (target_user_id, 'admin_bonus', CURRENT_DATE, token_amount)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + token_amount;
  
  RETURN TRUE;
END;
$function$;