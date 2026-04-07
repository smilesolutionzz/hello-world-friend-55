
CREATE TABLE public.user_onboarding_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  subject_type TEXT NOT NULL DEFAULT 'child',
  child_age INTEGER,
  child_gender TEXT,
  concern_keywords TEXT[] DEFAULT '{}',
  baseline_answers JSONB DEFAULT '{}',
  onboarding_completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_onboarding_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding data"
  ON public.user_onboarding_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding data"
  ON public.user_onboarding_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding data"
  ON public.user_onboarding_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
