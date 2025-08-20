-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  phone TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create test_types table for different test categories
CREATE TABLE public.test_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- '언어검사', '회복력테스트', 'ADHD검사'
  typebot_url TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 3,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create test_results table for storing test outcomes
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type_id UUID NOT NULL REFERENCES test_types(id),
  scores JSONB NOT NULL, -- {language: 85, attention: 70, ...}
  raw_data JSONB, -- Typebot original response
  ai_analysis TEXT,
  expert_feedback TEXT,
  pdf_url TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table for payment management
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- 'free', 'premium'
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Test types policies (public read)
CREATE POLICY "Anyone can view active test types" ON public.test_types
  FOR SELECT USING (is_active = true);

-- Test results policies
CREATE POLICY "Users can view their own test results" ON public.test_results
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own test results" ON public.test_results
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own test results" ON public.test_results
  FOR UPDATE USING (user_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Insert initial test types
INSERT INTO public.test_types (name, typebot_url, description) VALUES
  ('언어검사', 'https://typebot.co/language-test-demo', '언어 발달 및 소통 능력을 평가하는 3분 테스트'),
  ('회복력테스트', 'https://typebot.co/resilience-test-demo', '스트레스 상황에서의 회복력과 대처 능력을 측정하는 테스트'),
  ('ADHD검사', 'https://typebot.co/adhd-test-demo', 'ADHD 증상 및 집중력 관련 특성을 평가하는 간단한 검사');

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  
  INSERT INTO public.subscriptions (user_id, plan_type)
  VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();