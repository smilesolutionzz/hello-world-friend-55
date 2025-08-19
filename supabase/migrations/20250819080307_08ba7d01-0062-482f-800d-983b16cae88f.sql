-- Create referral system tables
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_profile_id UUID NOT NULL,
  referred_profile_id UUID NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  reward_tokens INTEGER NOT NULL DEFAULT 10,
  reward_given BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  FOREIGN KEY (referrer_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE(referrer_profile_id, referred_profile_id)
);

-- Enable RLS
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own referrals" 
ON public.user_referrals 
FOR SELECT 
USING (
  referrer_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  referred_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create referrals" 
ON public.user_referrals 
FOR INSERT 
WITH CHECK (referrer_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can update referrals" 
ON public.user_referrals 
FOR UPDATE 
USING (true);

-- Function to process referral rewards
CREATE OR REPLACE FUNCTION public.process_referral_reward(p_referral_code TEXT, p_referred_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_record RECORD;
  referred_profile_id UUID;
  result JSONB;
BEGIN
  -- Get referred user's profile
  SELECT id INTO referred_profile_id
  FROM public.profiles
  WHERE user_id = p_referred_user_id;
  
  IF referred_profile_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', '프로필을 찾을 수 없습니다'
    );
  END IF;
  
  -- Find the referral
  SELECT * INTO referral_record
  FROM public.user_referrals
  WHERE referral_code = p_referral_code
    AND status = 'pending'
    AND reward_given = false;
    
  IF referral_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', '유효하지 않은 추천 코드입니다'
    );
  END IF;
  
  -- Update referral record
  UPDATE public.user_referrals
  SET 
    referred_profile_id = referred_profile_id,
    status = 'completed',
    completed_at = now(),
    reward_given = true
  WHERE id = referral_record.id;
  
  -- Give tokens to referrer
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased)
  SELECT 
    p.user_id,
    referral_record.reward_tokens,
    0
  FROM public.profiles p
  WHERE p.id = referral_record.referrer_profile_id
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    current_tokens = user_tokens.current_tokens + referral_record.reward_tokens,
    updated_at = now();
  
  -- Record token usage history
  INSERT INTO public.token_usage_history (
    user_id, feature_type, tokens_used, feature_id
  )
  SELECT 
    p.user_id,
    'referral_reward',
    -referral_record.reward_tokens, -- Negative because it's a credit
    referral_record.id
  FROM public.profiles p
  WHERE p.id = referral_record.referrer_profile_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', '추천 보상이 지급되었습니다',
    'reward_tokens', referral_record.reward_tokens
  );
END;
$$;

-- Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_referrer_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_profile_id UUID;
  referral_code TEXT;
BEGIN
  -- Get referrer's profile
  SELECT id INTO referrer_profile_id
  FROM public.profiles
  WHERE user_id = p_referrer_user_id;
  
  IF referrer_profile_id IS NULL THEN
    RAISE EXCEPTION '프로필을 찾을 수 없습니다';
  END IF;
  
  -- Generate unique referral code
  referral_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  
  -- Insert referral record
  INSERT INTO public.user_referrals (
    referrer_profile_id,
    referred_profile_id,
    referral_code,
    status
  ) VALUES (
    referrer_profile_id,
    referrer_profile_id, -- Temporary, will be updated when someone uses the code
    referral_code,
    'pending'
  );
  
  RETURN referral_code;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_user_referrals_referral_code ON public.user_referrals(referral_code);
CREATE INDEX idx_user_referrals_referrer_profile_id ON public.user_referrals(referrer_profile_id);
CREATE INDEX idx_user_referrals_status ON public.user_referrals(status);