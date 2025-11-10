-- 리퍼럴 시스템 테이블 생성

-- 사용자 리퍼럴 코드 및 통계
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  total_invites INTEGER DEFAULT 0,
  total_bonus_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 리퍼럴 보상 기록
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reward_type TEXT NOT NULL, -- 'friend_invite', 'social_share'
  tokens_awarded INTEGER NOT NULL,
  referral_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- user_referrals 정책
CREATE POLICY "Users can view their own referral data"
  ON public.user_referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral data"
  ON public.user_referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral data"
  ON public.user_referrals FOR UPDATE
  USING (auth.uid() = user_id);

-- referral_rewards 정책
CREATE POLICY "Users can view their referral rewards"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referral rewards"
  ON public.referral_rewards FOR INSERT
  WITH CHECK (true);

-- 인덱스
CREATE INDEX idx_user_referrals_user_id ON public.user_referrals(user_id);
CREATE INDEX idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX idx_referral_rewards_referrer ON public.referral_rewards(referrer_id);
CREATE INDEX idx_referral_rewards_referee ON public.referral_rewards(referee_id);

-- 자동 updated_at 트리거
CREATE OR REPLACE FUNCTION public.update_user_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_referrals_timestamp
  BEFORE UPDATE ON public.user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_referrals_updated_at();