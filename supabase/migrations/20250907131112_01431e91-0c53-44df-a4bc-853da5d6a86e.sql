-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.weekly_mission_completions;
DROP TABLE IF EXISTS public.personalized_missions;

-- Create personalized_missions table with correct structure
CREATE TABLE public.personalized_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_title TEXT NOT NULL,
  mission_description TEXT NOT NULL,
  target_behavior TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  verification_photo_url TEXT,
  verification_note TEXT,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly_mission_completions table
CREATE TABLE public.weekly_mission_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  completed_missions INTEGER NOT NULL DEFAULT 0,
  total_missions INTEGER NOT NULL DEFAULT 7,
  is_week_completed BOOLEAN NOT NULL DEFAULT false,
  tokens_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.personalized_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_mission_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for personalized_missions
CREATE POLICY "Users can view their own missions" 
ON public.personalized_missions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own missions" 
ON public.personalized_missions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions" 
ON public.personalized_missions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missions" 
ON public.personalized_missions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for weekly_mission_completions
CREATE POLICY "Users can view their own completions" 
ON public.weekly_mission_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions" 
ON public.weekly_mission_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions" 
ON public.weekly_mission_completions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_personalized_missions_updated_at
BEFORE UPDATE ON public.personalized_missions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_mission_completions_updated_at
BEFORE UPDATE ON public.weekly_mission_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_personalized_missions_user_week ON public.personalized_missions(user_id, week_start);
CREATE INDEX idx_weekly_mission_completions_user_week ON public.weekly_mission_completions(user_id, week_start);