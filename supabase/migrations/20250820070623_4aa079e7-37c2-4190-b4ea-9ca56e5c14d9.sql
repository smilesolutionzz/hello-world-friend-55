-- Create profiles table
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

-- Create profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

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
CREATE POLICY "Users can view their own tokens" ON public.user_tokens
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own tokens" ON public.user_tokens
FOR UPDATE USING (user_id = auth.uid());

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
CREATE POLICY "Anyone can view test types" ON public.test_types
FOR SELECT USING (true);

-- Insert default test types
INSERT INTO public.test_types (name, description, category) VALUES
('ADHD Assessment', 'ADHD 증상 평가', 'assessment'),
('Depression Test', '우울증 진단 테스트', 'assessment'),
('Anxiety Test', '불안 장애 테스트', 'assessment'),
('Language Development', '언어 발달 평가', 'development'),
('Premium Assessment', '프리미엄 종합 평가', 'premium')
ON CONFLICT DO NOTHING;

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
CREATE POLICY "Users can view their own test results" ON public.test_results
FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own test results" ON public.test_results
FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create functions
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

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER grant_welcome_tokens_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_welcome_tokens();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();