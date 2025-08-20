-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  phone TEXT,
  birth_date DATE,
  subscription_tier TEXT DEFAULT 'free',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies (only if they don't exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Create user_tokens table
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_tokens INTEGER NOT NULL DEFAULT 5,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create user_tokens policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_tokens' AND policyname = 'Users can view their own tokens') THEN
    CREATE POLICY "Users can view their own tokens" ON public.user_tokens
    FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_tokens' AND policyname = 'Users can update their own tokens') THEN
    CREATE POLICY "Users can update their own tokens" ON public.user_tokens
    FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- Create token_usage_history table
CREATE TABLE IF NOT EXISTS public.token_usage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_type TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  feature_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.token_usage_history ENABLE ROW LEVEL SECURITY;

-- Create token_usage_history policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'token_usage_history' AND policyname = 'Users can view their own token usage') THEN
    CREATE POLICY "Users can view their own token usage" ON public.token_usage_history
    FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

-- Create test_results table
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  test_type_id UUID NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analysis TEXT,
  recommendations TEXT
);

-- Enable RLS
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create test_results policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'test_results' AND policyname = 'Users can view their own test results') THEN
    CREATE POLICY "Users can view their own test results" ON public.test_results
    FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'test_results' AND policyname = 'Users can create their own test results') THEN
    CREATE POLICY "Users can create their own test results" ON public.test_results
    FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Create test_types table
CREATE TABLE IF NOT EXISTS public.test_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_types ENABLE ROW LEVEL SECURITY;

-- Create test_types policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'test_types' AND policyname = 'Anyone can view test types') THEN
    CREATE POLICY "Anyone can view test types" ON public.test_types
    FOR SELECT USING (true);
  END IF;
END $$;

-- Insert default test types (only if they don't exist)
INSERT INTO public.test_types (name, description, category) 
SELECT 'ADHD Assessment', 'ADHD 증상 평가', 'assessment'
WHERE NOT EXISTS (SELECT 1 FROM public.test_types WHERE name = 'ADHD Assessment');

INSERT INTO public.test_types (name, description, category) 
SELECT 'Depression Test', '우울증 진단 테스트', 'assessment'
WHERE NOT EXISTS (SELECT 1 FROM public.test_types WHERE name = 'Depression Test');

INSERT INTO public.test_types (name, description, category) 
SELECT 'Anxiety Test', '불안 장애 테스트', 'assessment'
WHERE NOT EXISTS (SELECT 1 FROM public.test_types WHERE name = 'Anxiety Test');

INSERT INTO public.test_types (name, description, category) 
SELECT 'Language Development', '언어 발달 평가', 'development'
WHERE NOT EXISTS (SELECT 1 FROM public.test_types WHERE name = 'Language Development');

INSERT INTO public.test_types (name, description, category) 
SELECT 'Premium Assessment', '프리미엄 종합 평가', 'premium'
WHERE NOT EXISTS (SELECT 1 FROM public.test_types WHERE name = 'Premium Assessment');

-- Create or replace functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, phone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.grant_welcome_tokens()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, current_tokens)
  VALUES (NEW.id, 5)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create triggers if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'grant_welcome_tokens_trigger') THEN
    CREATE TRIGGER grant_welcome_tokens_trigger
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.grant_welcome_tokens();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;