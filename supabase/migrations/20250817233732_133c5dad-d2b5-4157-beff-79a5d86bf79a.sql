-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'expert', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create expert_notes table for professional comments
CREATE TABLE public.expert_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  is_visible_to_family BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create observation_assignments table for expert assignments
CREATE TABLE public.observation_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL,
  expert_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(observation_id, expert_user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_assignments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'expert' THEN 2
      WHEN 'viewer' THEN 3
    END
  LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies for expert_notes
CREATE POLICY "Admins can manage all expert notes"
ON public.expert_notes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Experts can manage their own notes"
ON public.expert_notes
FOR ALL
USING (author_id = auth.uid() AND public.has_role(auth.uid(), 'expert'));

CREATE POLICY "Users can view expert notes for their observations"
ON public.expert_notes
FOR SELECT
USING (
  observation_id IN (
    SELECT id FROM observation_sessions 
    WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  AND is_visible_to_family = true
);

-- RLS Policies for observation_assignments
CREATE POLICY "Admins can manage observation assignments"
ON public.observation_assignments
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Experts can view their assignments"
ON public.observation_assignments
FOR SELECT
USING (expert_user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_expert_notes_updated_at
BEFORE UPDATE ON public.expert_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();