-- Create user behavior tracking tables
CREATE TABLE public.user_behavior_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  behavior_type TEXT NOT NULL, -- 'login', 'text_input', 'page_view', 'assessment_start', etc.
  behavior_data JSONB NOT NULL DEFAULT '{}', -- stores specific behavior metrics
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  device_info JSONB DEFAULT '{}'
);

-- Create personalized recommendations table
CREATE TABLE public.personalized_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'motivation', 'meditation', 'social', 'lifestyle'
  content JSONB NOT NULL, -- stores recommendation data
  trigger_reason TEXT, -- what triggered this recommendation
  status TEXT DEFAULT 'pending', -- 'pending', 'delivered', 'engaged', 'dismissed'
  effectiveness_score INTEGER, -- user feedback score 1-5
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  engaged_at TIMESTAMP WITH TIME ZONE
);

-- Create lifestyle patterns table
CREATE TABLE public.lifestyle_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  pattern_date DATE NOT NULL,
  sleep_hours NUMERIC(3,1),
  sleep_quality INTEGER, -- 1-5 scale
  exercise_minutes INTEGER,
  mood_score INTEGER, -- 1-10 scale
  stress_level INTEGER, -- 1-10 scale
  social_interactions INTEGER,
  weather_condition TEXT,
  menstrual_cycle_day INTEGER, -- for relevant users
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user preferences and insights table
CREATE TABLE public.user_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'typing_pattern', 'usage_pattern', 'mood_correlation', etc.
  insight_data JSONB NOT NULL,
  confidence_score NUMERIC(3,2), -- 0.00-1.00
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, insight_type)
);

-- Create social matching table for anonymous connections
CREATE TABLE public.social_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id_1 UUID NOT NULL,
  profile_id_2 UUID NOT NULL,
  match_type TEXT NOT NULL, -- 'similar_age', 'similar_concerns', 'similar_progress'
  match_score NUMERIC(3,2), -- 0.00-1.00
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'blocked'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(profile_id_1, profile_id_2)
);

-- Enable Row Level Security
ALTER TABLE public.user_behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_behavior_logs
CREATE POLICY "Users can insert their own behavior logs" 
ON public.user_behavior_logs 
FOR INSERT 
WITH CHECK (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their own behavior logs" 
ON public.user_behavior_logs 
FOR SELECT 
USING (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Create RLS policies for personalized_recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.personalized_recommendations 
FOR SELECT 
USING (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their own recommendations" 
ON public.personalized_recommendations 
FOR UPDATE 
USING (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "System can insert recommendations" 
ON public.personalized_recommendations 
FOR INSERT 
WITH CHECK (true); -- Allow system to insert recommendations

-- Create RLS policies for lifestyle_patterns
CREATE POLICY "Users can manage their own lifestyle patterns" 
ON public.lifestyle_patterns 
FOR ALL 
USING (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Create RLS policies for user_insights
CREATE POLICY "Users can view their own insights" 
ON public.user_insights 
FOR SELECT 
USING (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "System can manage insights" 
ON public.user_insights 
FOR ALL 
USING (true); -- Allow system to manage insights

-- Create RLS policies for social_matches
CREATE POLICY "Users can view their own matches" 
ON public.social_matches 
FOR SELECT 
USING (
  profile_id_1 IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  profile_id_2 IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own matches" 
ON public.social_matches 
FOR UPDATE 
USING (
  profile_id_1 IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  profile_id_2 IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_user_behavior_logs_profile_timestamp ON public.user_behavior_logs(profile_id, timestamp DESC);
CREATE INDEX idx_user_behavior_logs_behavior_type ON public.user_behavior_logs(behavior_type);
CREATE INDEX idx_personalized_recommendations_profile_status ON public.personalized_recommendations(profile_id, status);
CREATE INDEX idx_lifestyle_patterns_profile_date ON public.lifestyle_patterns(profile_id, pattern_date DESC);
CREATE INDEX idx_user_insights_profile_type ON public.user_insights(profile_id, insight_type);
CREATE INDEX idx_social_matches_profiles ON public.social_matches(profile_id_1, profile_id_2);

-- Create trigger for updating lifestyle_patterns updated_at
CREATE TRIGGER update_lifestyle_patterns_updated_at
BEFORE UPDATE ON public.lifestyle_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();