-- Add AI insights table for storing personalized AI-generated health insights
CREATE TABLE IF NOT EXISTS public.ai_health_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'daily_recommendation', 'mood_analysis', 'energy_boost', 'stress_relief'
  content TEXT NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_health_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own AI insights" 
ON public.ai_health_insights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI insights" 
ON public.ai_health_insights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI insights" 
ON public.ai_health_insights 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add personalized challenges table
CREATE TABLE IF NOT EXISTS public.personalized_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  duration_days INTEGER NOT NULL,
  ai_generated BOOLEAN DEFAULT true,
  custom_goals JSONB,
  progress_metrics JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personalized_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own challenges" 
ON public.personalized_challenges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenges" 
ON public.personalized_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" 
ON public.personalized_challenges 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add AI coaching sessions table
CREATE TABLE IF NOT EXISTS public.ai_coaching_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- 'mood_coaching', 'energy_coaching', 'stress_management', 'goal_setting'
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  session_summary TEXT,
  mood_before INTEGER,
  mood_after INTEGER,
  action_items TEXT[],
  next_session_date TIMESTAMP WITH TIME ZONE,
  session_duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ai_coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own coaching sessions" 
ON public.ai_coaching_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coaching sessions" 
ON public.ai_coaching_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching sessions" 
ON public.ai_coaching_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personalized_challenges_updated_at
  BEFORE UPDATE ON public.personalized_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();