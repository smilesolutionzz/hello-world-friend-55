-- Add missing last_daily_bonus_date column to user_tokens table
ALTER TABLE public.user_tokens 
ADD COLUMN last_daily_bonus_date DATE DEFAULT CURRENT_DATE;

-- Add referral_bonus column as well since it's used in functions
ALTER TABLE public.user_tokens 
ADD COLUMN referral_bonus INTEGER DEFAULT 0;