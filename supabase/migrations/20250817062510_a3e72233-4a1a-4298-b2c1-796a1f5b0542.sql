-- AI Coach System Tables
CREATE TABLE public.ai_coach_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- 'emotion_monitoring', 'cbt_coaching', 'relationship_coaching', 'lifestyle_coaching'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  session_data JSONB NOT NULL DEFAULT '{}',
  emotion_analysis JSONB DEFAULT '{}',
  interventions_provided JSONB DEFAULT '[]',
  effectiveness_score INTEGER, -- 1-10 user rating
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.emotion_monitoring_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  detection_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  emotion_type TEXT NOT NULL, -- 'anger', 'sadness', 'stress', 'anxiety', etc.
  intensity_level INTEGER NOT NULL, -- 1-10 scale
  detection_source TEXT NOT NULL, -- 'voice_tone', 'text_pattern', 'behavior_pattern'
  raw_data JSONB NOT NULL DEFAULT '{}',
  intervention_triggered BOOLEAN DEFAULT false,
  intervention_type TEXT,
  user_response TEXT, -- user's response to intervention
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.cbt_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  cognitive_distortion_type TEXT NOT NULL, -- 'catastrophizing', 'all_or_nothing', 'mind_reading', etc.
  trigger_situations JSONB NOT NULL DEFAULT '[]',
  negative_thoughts JSONB NOT NULL DEFAULT '[]',
  restructured_thoughts JSONB NOT NULL DEFAULT '[]',
  behavior_experiments JSONB NOT NULL DEFAULT '[]',
  progress_notes TEXT,
  last_occurrence TIMESTAMP WITH TIME ZONE,
  improvement_score INTEGER, -- 1-10 tracking improvement
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.cbt_homework_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  assignment_type TEXT NOT NULL, -- 'thought_record', 'behavior_experiment', 'exposure_exercise'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions JSONB NOT NULL DEFAULT '{}',
  due_date DATE,
  completion_status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
  completion_data JSONB DEFAULT '{}',
  ai_feedback TEXT,
  difficulty_level INTEGER, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.relationship_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  relationship_type TEXT NOT NULL, -- 'family', 'romantic', 'friendship', 'work'
  relationship_id TEXT, -- identifier for specific relationship
  communication_patterns JSONB NOT NULL DEFAULT '{}',
  conflict_triggers JSONB NOT NULL DEFAULT '[]',
  positive_interactions JSONB NOT NULL DEFAULT '[]',
  improvement_suggestions JSONB NOT NULL DEFAULT '[]',
  satisfaction_score INTEGER, -- 1-10 user rating
  last_interaction_analysis TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lifestyle_coaching_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  tracking_date DATE NOT NULL,
  sleep_data JSONB DEFAULT '{}', -- hours, quality, bedtime, wake_time
  nutrition_data JSONB DEFAULT '{}', -- meals, mood_impact, energy_levels
  exercise_data JSONB DEFAULT '{}', -- type, duration, intensity, mood_after
  mental_health_correlation JSONB DEFAULT '{}',
  ai_recommendations JSONB DEFAULT '[]',
  adherence_score INTEGER, -- 1-10 how well they followed recommendations
  seasonal_factors JSONB DEFAULT '{}',
  hormonal_factors JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_coach_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  session_id UUID REFERENCES public.ai_coach_sessions(id),
  message_type TEXT NOT NULL, -- 'user', 'ai_coach'
  content TEXT NOT NULL,
  emotion_detected TEXT,
  intervention_type TEXT,
  conversation_context JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.coaching_effectiveness_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  overall_wellbeing_score INTEGER, -- 1-10 daily self-assessment
  stress_management_score INTEGER,
  relationship_satisfaction_score INTEGER,
  cbt_skill_application_score INTEGER,
  lifestyle_adherence_score INTEGER,
  ai_coach_helpfulness_rating INTEGER,
  specific_improvements JSONB DEFAULT '[]',
  areas_needing_focus JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_monitoring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle_coaching_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_effectiveness_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage their AI coach sessions" ON public.ai_coach_sessions
FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their emotion monitoring" ON public.emotion_monitoring_logs
FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their CBT patterns" ON public.cbt_patterns
FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their CBT homework" ON public.cbt_homework_assignments
FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their relationship analysis" ON public.relationship_analysis
FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their lifestyle coaching data" ON public.lifestyle_coaching_data
FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their AI coach conversations" ON public.ai_coach_conversations
FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their coaching effectiveness metrics" ON public.coaching_effectiveness_metrics
FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_ai_coach_sessions_profile_id ON public.ai_coach_sessions(profile_id);
CREATE INDEX idx_emotion_monitoring_profile_timestamp ON public.emotion_monitoring_logs(profile_id, detection_timestamp);
CREATE INDEX idx_cbt_patterns_profile_id ON public.cbt_patterns(profile_id);
CREATE INDEX idx_cbt_homework_profile_status ON public.cbt_homework_assignments(profile_id, completion_status);
CREATE INDEX idx_relationship_analysis_profile_type ON public.relationship_analysis(profile_id, relationship_type);
CREATE INDEX idx_lifestyle_coaching_profile_date ON public.lifestyle_coaching_data(profile_id, tracking_date);
CREATE INDEX idx_ai_coach_conversations_session ON public.ai_coach_conversations(session_id);
CREATE INDEX idx_coaching_metrics_profile_date ON public.coaching_effectiveness_metrics(profile_id, metric_date);

-- Create trigger for updated_at
CREATE TRIGGER update_cbt_patterns_updated_at
BEFORE UPDATE ON public.cbt_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_relationship_analysis_updated_at
BEFORE UPDATE ON public.relationship_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();