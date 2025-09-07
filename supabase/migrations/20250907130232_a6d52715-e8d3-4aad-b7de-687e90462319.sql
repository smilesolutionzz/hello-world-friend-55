-- Create personalized missions table
CREATE TABLE IF NOT EXISTS public.personalized_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_title TEXT NOT NULL,
  mission_description TEXT NOT NULL,
  mission_type TEXT NOT NULL DEFAULT 'daily',
  target_behavior TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  week_start DATE NOT NULL DEFAULT CURRENT_DATE,
  week_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '6 days'),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  verification_photo_url TEXT,
  verification_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly mission completion tracking table
CREATE TABLE IF NOT EXISTS public.weekly_mission_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  completed_missions INTEGER NOT NULL DEFAULT 0,
  total_missions INTEGER NOT NULL DEFAULT 7,
  is_week_completed BOOLEAN NOT NULL DEFAULT false,
  tokens_awarded INTEGER NOT NULL DEFAULT 0,
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.personalized_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_mission_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for personalized missions
CREATE POLICY "Users can view their own missions" 
ON public.personalized_missions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions" 
ON public.personalized_missions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create missions for users" 
ON public.personalized_missions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Create RLS policies for weekly completions
CREATE POLICY "Users can view their own completions" 
ON public.weekly_mission_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions" 
ON public.weekly_mission_completions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create completions for users" 
ON public.weekly_mission_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_missions()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_personalized_missions_updated_at
  BEFORE UPDATE ON public.personalized_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_missions();

CREATE TRIGGER update_weekly_mission_completions_updated_at
  BEFORE UPDATE ON public.weekly_mission_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_missions();

-- Create function to check and award weekly completion tokens
CREATE OR REPLACE FUNCTION public.check_weekly_mission_completion(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  week_record RECORD;
  current_week_start DATE;
  current_week_end DATE;
  completed_count INTEGER;
BEGIN
  -- Calculate current week start (Monday)
  current_week_start := DATE_TRUNC('week', CURRENT_DATE);
  current_week_end := current_week_start + INTERVAL '6 days';
  
  -- Count completed missions for current week
  SELECT COUNT(*) INTO completed_count
  FROM public.personalized_missions
  WHERE user_id = p_user_id
    AND week_start = current_week_start
    AND is_completed = true;
  
  -- Get or create weekly completion record
  INSERT INTO public.weekly_mission_completions (user_id, week_start, week_end, completed_missions, total_missions)
  VALUES (p_user_id, current_week_start, current_week_end, completed_count, 7)
  ON CONFLICT (user_id, week_start)
  DO UPDATE SET 
    completed_missions = completed_count,
    updated_at = now();
  
  -- Check if week is completed (all 7 missions done)
  SELECT * INTO week_record
  FROM public.weekly_mission_completions
  WHERE user_id = p_user_id AND week_start = current_week_start;
  
  -- If all 7 missions completed and not yet awarded
  IF week_record.completed_missions >= 7 AND NOT week_record.is_week_completed THEN
    -- Award 7 tokens
    UPDATE public.user_tokens
    SET 
      current_tokens = current_tokens + 7,
      total_purchased = total_purchased + 7
    WHERE user_id = p_user_id;
    
    -- Mark week as completed
    UPDATE public.weekly_mission_completions
    SET 
      is_week_completed = true,
      tokens_awarded = 7,
      completion_date = now()
    WHERE id = week_record.id;
    
    -- Log the token reward
    INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
    VALUES (p_user_id, 'weekly_mission_bonus', CURRENT_DATE, 7);
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;