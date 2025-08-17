-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  role TEXT CHECK (role IN ('parent', 'child', 'guardian', 'therapist')) DEFAULT 'parent',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create families table for family groups
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family_members table for family relationships
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL, -- 'parent', 'child', 'spouse', 'sibling', etc.
  is_primary_caregiver BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, profile_id)
);

-- Create assessments table for storing test results
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  age_group TEXT NOT NULL CHECK (age_group IN ('infant', 'child', 'adult')),
  age_at_assessment INTEGER NOT NULL,
  results JSONB NOT NULL, -- Store assessment answers/scores
  analysis TEXT, -- AI generated analysis
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  recommendations TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultations table for storing consultation records
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  expert_name TEXT NOT NULL,
  expert_specialization TEXT,
  session_type TEXT CHECK (session_type IN ('individual', 'family', 'group')),
  duration_minutes INTEGER,
  notes TEXT,
  next_appointment TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_sessions table for AI counselor conversations
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  risk_levels JSONB NOT NULL DEFAULT '[]'::jsonb, -- Track risk level changes
  session_summary TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for families
CREATE POLICY "Family members can view their families" 
ON public.families FOR SELECT 
USING (
  id IN (
    SELECT fm.family_id 
    FROM public.family_members fm 
    JOIN public.profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create families" 
ON public.families FOR INSERT 
WITH CHECK (
  created_by IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Family creators can update their families" 
ON public.families FOR UPDATE 
USING (
  created_by IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for family_members
CREATE POLICY "Family members can view family membership" 
ON public.family_members FOR SELECT 
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM public.family_members fm 
    JOIN public.profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Family creators can manage family members" 
ON public.family_members FOR ALL 
USING (
  family_id IN (
    SELECT f.id 
    FROM public.families f 
    JOIN public.profiles p ON f.created_by = p.id 
    WHERE p.user_id = auth.uid()
  )
);

-- Create RLS policies for assessments
CREATE POLICY "Users can view family assessments" 
ON public.assessments FOR SELECT 
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM public.family_members fm 
    JOIN public.profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create assessments for family members" 
ON public.assessments FOR INSERT 
WITH CHECK (
  profile_id IN (
    SELECT fm.profile_id 
    FROM public.family_members fm 
    JOIN public.profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for consultations
CREATE POLICY "Users can view family consultations" 
ON public.consultations FOR SELECT 
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM public.family_members fm 
    JOIN public.profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create consultations for family members" 
ON public.consultations FOR INSERT 
WITH CHECK (
  profile_id IN (
    SELECT fm.profile_id 
    FROM public.family_members fm 
    JOIN public.profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions" 
ON public.chat_sessions FOR SELECT 
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own chat sessions" 
ON public.chat_sessions FOR INSERT 
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own chat sessions" 
ON public.chat_sessions FOR UPDATE 
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

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

CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, phone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_family_members_profile_id ON public.family_members(profile_id);
CREATE INDEX idx_assessments_profile_id ON public.assessments(profile_id);
CREATE INDEX idx_assessments_family_id ON public.assessments(family_id);
CREATE INDEX idx_consultations_profile_id ON public.consultations(profile_id);
CREATE INDEX idx_consultations_family_id ON public.consultations(family_id);
CREATE INDEX idx_chat_sessions_profile_id ON public.chat_sessions(profile_id);