-- Create metaverse therapy environment tables

-- Virtual therapy environments
CREATE TABLE public.therapy_environments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  environment_type TEXT NOT NULL CHECK (environment_type IN ('forest', 'beach', 'space', 'library', 'garden', 'mountain', 'urban', 'fantasy')),
  description TEXT,
  scene_config JSONB NOT NULL DEFAULT '{}',
  ambient_sounds JSONB DEFAULT '[]',
  lighting_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User environment preferences
CREATE TABLE public.user_environment_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  preferred_environments JSONB NOT NULL DEFAULT '[]',
  favorite_environment_id UUID,
  comfort_settings JSONB DEFAULT '{}',
  accessibility_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Avatar customization
CREATE TABLE public.user_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  avatar_name TEXT,
  appearance_config JSONB NOT NULL DEFAULT '{}',
  animation_preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Metaverse therapy sessions
CREATE TABLE public.metaverse_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type TEXT NOT NULL CHECK (session_type IN ('individual', 'group', 'exposure', 'roleplay', 'social_training')),
  environment_id UUID NOT NULL,
  host_profile_id UUID NOT NULL,
  session_name TEXT,
  description TEXT,
  max_participants INTEGER DEFAULT 8,
  current_participants INTEGER DEFAULT 0,
  session_config JSONB DEFAULT '{}',
  scenario_data JSONB DEFAULT '{}',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session participants
CREATE TABLE public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  avatar_id UUID,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  participant_role TEXT DEFAULT 'participant' CHECK (participant_role IN ('host', 'co_host', 'participant', 'observer')),
  interaction_data JSONB DEFAULT '{}',
  therapy_progress JSONB DEFAULT '{}'
);

-- Virtual therapy scenarios
CREATE TABLE public.therapy_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('social_anxiety', 'job_interview', 'public_speaking', 'family_conflict', 'trauma_exposure', 'social_skills', 'child_play')),
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
  target_age_group TEXT CHECK (target_age_group IN ('child', 'teen', 'adult', 'elderly', 'all')),
  scenario_config JSONB NOT NULL DEFAULT '{}',
  environment_requirements JSONB DEFAULT '{}',
  ai_characters JSONB DEFAULT '[]',
  success_criteria JSONB DEFAULT '{}',
  therapeutic_goals JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI virtual therapist configurations
CREATE TABLE public.ai_therapists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  appearance_config JSONB NOT NULL DEFAULT '{}',
  personality_traits JSONB DEFAULT '{}',
  therapy_approaches JSONB DEFAULT '[]',
  interaction_styles JSONB DEFAULT '{}',
  voice_config JSONB DEFAULT '{}',
  animation_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User interactions with AI therapists
CREATE TABLE public.ai_therapist_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  ai_therapist_id UUID NOT NULL,
  session_id UUID,
  interaction_type TEXT CHECK (interaction_type IN ('chat', 'voice', 'gesture', 'exercise')),
  interaction_data JSONB NOT NULL DEFAULT '{}',
  emotional_analysis JSONB DEFAULT '{}',
  therapy_progress JSONB DEFAULT '{}',
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time user presence in metaverse
CREATE TABLE public.metaverse_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  session_id UUID,
  environment_id UUID,
  avatar_id UUID,
  position_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  connection_quality JSONB DEFAULT '{}',
  UNIQUE(profile_id, session_id)
);

-- Enable RLS on all tables
ALTER TABLE public.therapy_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_environment_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metaverse_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_therapist_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metaverse_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Therapy environments (public read)
CREATE POLICY "Anyone can view therapy environments" 
ON public.therapy_environments 
FOR SELECT 
USING (true);

-- User environment preferences
CREATE POLICY "Users can manage their environment preferences" 
ON public.user_environment_preferences 
FOR ALL 
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- User avatars
CREATE POLICY "Users can manage their avatars" 
ON public.user_avatars 
FOR ALL 
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Metaverse sessions
CREATE POLICY "Users can view public sessions and their own sessions" 
ON public.metaverse_sessions 
FOR SELECT 
USING (is_public = true OR host_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR id IN (SELECT session_id FROM session_participants sp JOIN profiles p ON sp.profile_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY "Users can create sessions" 
ON public.metaverse_sessions 
FOR INSERT 
WITH CHECK (host_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Session hosts can update their sessions" 
ON public.metaverse_sessions 
FOR UPDATE 
USING (host_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Session participants
CREATE POLICY "Users can view session participants for their sessions" 
ON public.session_participants 
FOR SELECT 
USING (session_id IN (SELECT id FROM metaverse_sessions WHERE host_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) OR profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can join sessions" 
ON public.session_participants 
FOR INSERT 
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their participation" 
ON public.session_participants 
FOR UPDATE 
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Therapy scenarios (public read)
CREATE POLICY "Anyone can view therapy scenarios" 
ON public.therapy_scenarios 
FOR SELECT 
USING (true);

-- AI therapists (public read)
CREATE POLICY "Anyone can view AI therapists" 
ON public.ai_therapists 
FOR SELECT 
USING (true);

-- AI therapist interactions
CREATE POLICY "Users can manage their AI therapist interactions" 
ON public.ai_therapist_interactions 
FOR ALL 
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Metaverse presence
CREATE POLICY "Users can view presence in their sessions" 
ON public.metaverse_presence 
FOR SELECT 
USING (session_id IN (SELECT id FROM metaverse_sessions ms WHERE ms.host_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR ms.id IN (SELECT session_id FROM session_participants sp JOIN profiles p ON sp.profile_id = p.id WHERE p.user_id = auth.uid())));

CREATE POLICY "Users can update their own presence" 
ON public.metaverse_presence 
FOR ALL 
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_user_environment_preferences_profile ON user_environment_preferences(profile_id);
CREATE INDEX idx_user_avatars_profile ON user_avatars(profile_id);
CREATE INDEX idx_metaverse_sessions_host ON metaverse_sessions(host_profile_id);
CREATE INDEX idx_metaverse_sessions_environment ON metaverse_sessions(environment_id);
CREATE INDEX idx_metaverse_sessions_status ON metaverse_sessions(status);
CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_session_participants_profile ON session_participants(profile_id);
CREATE INDEX idx_therapy_scenarios_type ON therapy_scenarios(scenario_type);
CREATE INDEX idx_ai_therapist_interactions_profile ON ai_therapist_interactions(profile_id);
CREATE INDEX idx_metaverse_presence_session ON metaverse_presence(session_id);
CREATE INDEX idx_metaverse_presence_profile ON metaverse_presence(profile_id);

-- Create trigger for updating user_environment_preferences updated_at
CREATE TRIGGER update_user_environment_preferences_updated_at
  BEFORE UPDATE ON public.user_environment_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating user_avatars updated_at
CREATE TRIGGER update_user_avatars_updated_at
  BEFORE UPDATE ON public.user_avatars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating metaverse_sessions updated_at
CREATE TRIGGER update_metaverse_sessions_updated_at
  BEFORE UPDATE ON public.metaverse_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default therapy environments
INSERT INTO public.therapy_environments (name, environment_type, description, scene_config, ambient_sounds, lighting_config) VALUES
('평화로운 숲', 'forest', '고요한 숲 속에서 자연의 소리와 함께 마음의 안정을 찾으세요', '{"trees": 50, "clearings": 3, "wildlife": true}', '["birds", "leaves", "wind"]', '{"type": "natural", "warmth": 0.7}'),
('고요한 해변', 'beach', '파도 소리와 함께 마음을 정화하는 바닷가 환경', '{"waves": true, "sand": "white", "rocks": false}', '["waves", "seagulls", "wind"]', '{"type": "sunset", "warmth": 0.8}'),
('무한 우주', 'space', '별빛 가득한 우주에서 무한한 가능성을 탐험하세요', '{"stars": 1000, "planets": 3, "nebula": true}', '["space_ambient", "cosmic_wind"]', '{"type": "cosmic", "brightness": 0.3}'),
('아늑한 도서관', 'library', '따뜻하고 조용한 도서관에서 내면의 지혜를 발견하세요', '{"bookshelves": 20, "fireplace": true, "reading_nooks": 4}', '["page_turning", "fireplace", "quiet"]', '{"type": "warm", "brightness": 0.6}'),
('치유의 정원', 'garden', '아름다운 꽃과 향기로 가득한 치유의 공간', '{"flowers": true, "fountain": true, "butterflies": true}', '["water", "bees", "birds"]', '{"type": "morning", "warmth": 0.9}'),
('산정의 사원', 'mountain', '높은 산 위의 평화로운 사원에서 명상과 성찰을 경험하세요', '{"temple": true, "meditation_spots": 5, "view": "panoramic"}', '["wind", "bells", "silence"]', '{"type": "serene", "brightness": 0.7}');

-- Insert default therapy scenarios
INSERT INTO public.therapy_scenarios (scenario_type, title, description, difficulty_level, target_age_group, scenario_config, therapeutic_goals) VALUES
('social_anxiety', '카페에서 주문하기', '낯선 카페에서 음료를 주문하는 상황을 연습합니다', 3, 'adult', '{"setting": "cafe", "npcs": ["barista"], "objectives": ["order_drink", "make_payment"]}', '["social_confidence", "anxiety_reduction"]'),
('job_interview', '면접 연습', '다양한 직종의 면접 상황을 가상으로 경험합니다', 6, 'adult', '{"setting": "office", "npcs": ["interviewer"], "questions": "dynamic"}', '["interview_skills", "confidence_building"]'),
('public_speaking', '프레젠테이션 연습', '청중 앞에서 발표하는 상황을 안전하게 연습합니다', 7, 'adult', '{"setting": "auditorium", "audience_size": "adjustable", "topics": "customizable"}', '["public_speaking", "confidence"]'),
('family_conflict', '가족 대화 연습', '가족 간 갈등 상황에서 건설적인 대화법을 연습합니다', 5, 'all', '{"setting": "home", "family_roles": "customizable", "conflict_topics": "various"}', '["communication_skills", "conflict_resolution"]'),
('social_skills', '친구 사귀기', '새로운 사람들과 자연스럽게 대화하고 관계를 형성하는 연습', 4, 'teen', '{"setting": "school", "npcs": ["classmates"], "activities": ["group_work", "lunch"]}', '["social_skills", "friendship_building"]'),
('child_play', '마법의 놀이방', '아이들을 위한 창의적이고 치료적인 놀이 환경', 2, 'child', '{"setting": "playroom", "toys": "interactive", "games": "therapeutic"}', '["emotional_expression", "social_development"]');

-- Insert default AI therapists
INSERT INTO public.ai_therapists (name, specialization, appearance_config, personality_traits, therapy_approaches) VALUES
('닥터 하모니', '불안장애 전문', '{"gender": "female", "age": "35", "style": "professional", "warmth": "high"}', '{"empathy": 9, "patience": 10, "wisdom": 8}', '["CBT", "mindfulness", "exposure_therapy"]'),
('상담사 세레니티', '우울증 전문', '{"gender": "neutral", "age": "40", "style": "casual", "warmth": "very_high"}', '{"understanding": 10, "gentleness": 9, "optimism": 8}', '["humanistic", "positive_psychology", "art_therapy"]'),
('치료사 코스모', '트라우마 전문', '{"gender": "male", "age": "45", "style": "authoritative", "warmth": "medium"}', '{"stability": 10, "strength": 9, "calmness": 10}', '["EMDR", "trauma_informed", "somatic_therapy"]'),
('놀이친구 루나', '아동 전문', '{"gender": "female", "age": "25", "style": "playful", "warmth": "very_high"}', '{"playfulness": 10, "creativity": 9, "energy": 8}', '["play_therapy", "art_therapy", "storytelling"]');