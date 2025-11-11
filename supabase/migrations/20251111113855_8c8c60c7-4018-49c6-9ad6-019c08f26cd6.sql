-- 사용자 프로필 테이블 생성 (토큰 및 레퍼럴 시스템)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  tokens INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 레퍼럴 추적 테이블
CREATE TABLE IF NOT EXISTS public.referral_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_code TEXT NOT NULL,
  referred_user_id UUID NOT NULL,
  tokens_awarded INTEGER NOT NULL DEFAULT 10,
  reward_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_code, referred_user_id)
);

-- RLS 활성화
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_records ENABLE ROW LEVEL SECURITY;

-- user_profiles RLS 정책
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- referral_records RLS 정책
CREATE POLICY "Users can view referrals they are part of"
ON public.referral_records FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_profiles 
    WHERE referral_code = referrer_code
  )
  OR auth.uid() = referred_user_id
);

CREATE POLICY "System can insert referral records"
ON public.referral_records FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update referral records"
ON public.referral_records FOR UPDATE
USING (true);

-- 레퍼럴 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 자동으로 레퍼럴 코드 생성 트리거
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
    WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE referral_code = NEW.referral_code) LOOP
      NEW.referral_code := generate_referral_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code_trigger
BEFORE INSERT ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_referral_code();

-- 업데이트 타임스탬프 트리거
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_timestamp
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profile_timestamp();