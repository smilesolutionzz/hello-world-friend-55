-- Add personalized mission generation table
CREATE TABLE public.personalized_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_content JSONB NOT NULL,
  mission_type TEXT NOT NULL DEFAULT 'ai_generated',
  priority_level INTEGER NOT NULL DEFAULT 1,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  based_on_data JSONB NULL -- 미션 생성 근거 데이터
);

-- Enable RLS on personalized_missions
ALTER TABLE public.personalized_missions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for personalized_missions
CREATE POLICY "Users can view their own personalized missions"
ON public.personalized_missions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personalized missions" 
ON public.personalized_missions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personalized missions"
ON public.personalized_missions FOR UPDATE  
USING (auth.uid() = user_id);

-- Add user needs/preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  primary_concerns TEXT[] DEFAULT '{}',
  health_goals TEXT[] DEFAULT '{}',
  lifestyle_preferences JSONB DEFAULT '{}',
  assessment_history JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Create updated_at trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();