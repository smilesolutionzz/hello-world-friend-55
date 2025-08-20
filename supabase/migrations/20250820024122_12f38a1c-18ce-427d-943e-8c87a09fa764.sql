-- Create test_types table for different test categories (HIGHLIGHT MVP)
CREATE TABLE IF NOT EXISTS public.test_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- '언어검사', '회복력테스트', 'ADHD검사'
  typebot_url TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 3,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create test_results table for storing test outcomes (HIGHLIGHT MVP)
CREATE TABLE IF NOT EXISTS public.test_results (
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

-- Add subscription columns to existing profiles table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_tier') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.test_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

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

-- Insert initial test types for HIGHLIGHT
INSERT INTO public.test_types (name, typebot_url, description) VALUES
  ('언어검사', 'https://typebot.co/language-test-demo', '언어 발달 및 소통 능력을 평가하는 3분 테스트'),
  ('회복력테스트', 'https://typebot.co/resilience-test-demo', '스트레스 상황에서의 회복력과 대처 능력을 측정하는 테스트'),
  ('ADHD검사', 'https://typebot.co/adhd-test-demo', 'ADHD 증상 및 집중력 관련 특성을 평가하는 간단한 검사')
ON CONFLICT DO NOTHING;