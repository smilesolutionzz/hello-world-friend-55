-- Create expert_profiles table
CREATE TABLE public.expert_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialization TEXT[] DEFAULT '{}',
  license_info TEXT,
  experience_years TEXT,
  workplace TEXT,
  target_age_groups TEXT[] DEFAULT '{}',
  expertise_areas TEXT[] DEFAULT '{}',
  introduction TEXT,
  available_hours TEXT,
  status TEXT DEFAULT 'pending_approval',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create institution_profiles table
CREATE TABLE public.institution_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_type TEXT,
  institution_name TEXT,
  department TEXT,
  role TEXT,
  target_population TEXT[] DEFAULT '{}',
  service_types TEXT[] DEFAULT '{}',
  expected_user_count TEXT,
  usage_description TEXT,
  status TEXT DEFAULT 'pending_approval',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for expert_profiles
CREATE POLICY "Users can view their own expert profile" 
ON public.expert_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expert profile" 
ON public.expert_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expert profile" 
ON public.expert_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for institution_profiles
CREATE POLICY "Users can view their own institution profile" 
ON public.institution_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own institution profile" 
ON public.institution_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own institution profile" 
ON public.institution_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);