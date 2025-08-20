-- Create missing tables for the existing backend functions

-- Create expert_notes table for expert annotations
CREATE TABLE public.expert_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  observation_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_visible_to_family BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create observation_logs table for behavior observations
CREATE TABLE public.observation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  family_member_id UUID REFERENCES public.family_members ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  behavior_type TEXT,
  severity INTEGER CHECK (severity >= 1 AND severity <= 5),
  location TEXT,
  triggers TEXT[],
  duration_minutes INTEGER,
  media_files JSONB DEFAULT '[]',
  tags TEXT[],
  is_crisis BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create observation_sessions table
CREATE TABLE public.observation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  family_member_id UUID REFERENCES public.family_members ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  duration_minutes INTEGER,
  observations JSONB DEFAULT '[]',
  summary TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table for user subscription management
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'KRW',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tokens table for token-based payments
CREATE TABLE public.tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  token_count INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add family_id column to family_members table (self-referencing for family groups)
ALTER TABLE public.family_members ADD COLUMN family_id UUID REFERENCES public.family_members ON DELETE CASCADE;

-- Enable Row Level Security on new tables
ALTER TABLE public.expert_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expert_notes
CREATE POLICY "Expert notes are viewable by authors and family" ON public.expert_notes
  FOR SELECT USING (
    auth.uid() = author_id OR 
    (is_visible_to_family AND EXISTS (
      SELECT 1 FROM public.observation_logs ol 
      WHERE ol.id = observation_id AND ol.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create expert notes" ON public.expert_notes
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their expert notes" ON public.expert_notes
  FOR UPDATE USING (auth.uid() = author_id);

-- Create RLS policies for observation_logs
CREATE POLICY "Users can manage their own observation logs" ON public.observation_logs
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for observation_sessions
CREATE POLICY "Users can manage their own observation sessions" ON public.observation_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for tokens
CREATE POLICY "Users can view their own tokens" ON public.tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON public.tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_expert_notes_updated_at
  BEFORE UPDATE ON public.expert_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_observation_logs_updated_at
  BEFORE UPDATE ON public.observation_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_observation_sessions_updated_at
  BEFORE UPDATE ON public.observation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tokens_updated_at
  BEFORE UPDATE ON public.tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to initialize user tokens when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tokens (user_id, token_count)
  VALUES (NEW.user_id, 10); -- Give new users 10 free tokens
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_create_tokens
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_tokens();