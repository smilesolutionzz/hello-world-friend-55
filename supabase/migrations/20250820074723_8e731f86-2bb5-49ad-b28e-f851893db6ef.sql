-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_types table for different assessment types
CREATE TABLE public.test_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_results table for storing assessment results
CREATE TABLE public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  test_type_id UUID NOT NULL REFERENCES public.test_types ON DELETE CASCADE,
  scores JSONB,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessments table for comprehensive analysis
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  age_group TEXT NOT NULL,
  age_at_assessment INTEGER,
  results JSONB,
  analysis TEXT,
  risk_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family_members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create timeline_activities table
CREATE TABLE public.timeline_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.family_members ON DELETE CASCADE,
  member_id UUID REFERENCES public.family_members ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  tags TEXT[],
  files JSONB DEFAULT '[]',
  actor JSONB,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_rooms table for real-time counseling
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  assessment_results JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for test_types (public read)
CREATE POLICY "Test types are viewable by everyone" ON public.test_types
  FOR SELECT USING (true);

-- Create RLS policies for test_results
CREATE POLICY "Users can view their own test results" ON public.test_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test results" ON public.test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for assessments
CREATE POLICY "Users can view their own assessments" ON public.assessments
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

CREATE POLICY "Users can insert their own assessments" ON public.assessments
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- Create RLS policies for family_members
CREATE POLICY "Users can manage their own family members" ON public.family_members
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for timeline_activities
CREATE POLICY "Users can manage their own timeline activities" ON public.timeline_activities
  FOR ALL USING (auth.uid() = (SELECT user_id FROM public.family_members WHERE id = member_id));

-- Create RLS policies for chat_rooms
CREATE POLICY "Users can manage their own chat rooms" ON public.chat_rooms
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can manage messages in their chat rooms" ON public.chat_messages
  FOR ALL USING (auth.uid() = (SELECT user_id FROM public.chat_rooms WHERE id = room_id) OR auth.uid() = sender_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some default test types
INSERT INTO public.test_types (name, description) VALUES
  ('ADHD Assessment', 'Comprehensive ADHD evaluation'),
  ('Depression Test', 'Depression screening assessment'),
  ('Anxiety Test', 'Anxiety disorder evaluation'),
  ('Language Development', 'Language skills assessment'),
  ('Premium Assessment', 'Comprehensive premium evaluation');