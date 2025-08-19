-- Create metaverse_sessions table
CREATE TABLE public.metaverse_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type TEXT NOT NULL,
  environment_id UUID NOT NULL REFERENCES therapy_environments(id),
  host_profile_id UUID NOT NULL REFERENCES profiles(id),
  session_name TEXT NOT NULL,
  description TEXT,
  max_participants INTEGER DEFAULT 8,
  current_participants INTEGER DEFAULT 0,
  session_config JSONB DEFAULT '{}',
  scenario_data JSONB DEFAULT '{}',
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'planned',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_participants table
CREATE TABLE public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES metaverse_sessions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  avatar_id UUID,
  participant_role TEXT NOT NULL,
  therapy_progress JSONB DEFAULT '{}',
  interaction_data JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_avatars table
CREATE TABLE public.user_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  avatar_name TEXT NOT NULL,
  appearance_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_environment_preferences table
CREATE TABLE public.user_environment_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  preferred_environments UUID[] DEFAULT '{}',
  favorite_environment_id UUID REFERENCES therapy_environments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metaverse_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_environment_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for metaverse_sessions
CREATE POLICY "Users can create their own sessions" 
ON public.metaverse_sessions 
FOR INSERT 
WITH CHECK (host_profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can view public sessions or their own sessions"
ON public.metaverse_sessions
FOR SELECT
USING (
  is_public = true OR 
  host_profile_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ) OR
  id IN (
    SELECT session_id FROM session_participants 
    WHERE profile_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own sessions"
ON public.metaverse_sessions
FOR UPDATE
USING (host_profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- RLS policies for session_participants
CREATE POLICY "Users can manage their session participation"
ON public.session_participants
FOR ALL
USING (profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
))
WITH CHECK (profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- RLS policies for user_avatars
CREATE POLICY "Users can manage their avatars"
ON public.user_avatars
FOR ALL
USING (profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
))
WITH CHECK (profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- RLS policies for user_environment_preferences
CREATE POLICY "Users can manage their environment preferences"
ON public.user_environment_preferences
FOR ALL
USING (profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
))
WITH CHECK (profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_metaverse_sessions_environment_id ON public.metaverse_sessions(environment_id);
CREATE INDEX idx_metaverse_sessions_host_profile_id ON public.metaverse_sessions(host_profile_id);
CREATE INDEX idx_session_participants_session_id ON public.session_participants(session_id);
CREATE INDEX idx_session_participants_profile_id ON public.session_participants(profile_id);
CREATE INDEX idx_user_avatars_profile_id ON public.user_avatars(profile_id);
CREATE INDEX idx_user_environment_preferences_profile_id ON public.user_environment_preferences(profile_id);