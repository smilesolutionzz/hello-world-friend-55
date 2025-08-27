-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'expert', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create RLS policies
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create subscribers table for admin analytics
CREATE TABLE public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email TEXT,
    subscribed BOOLEAN DEFAULT false,
    subscription_tier TEXT,
    subscription_start TIMESTAMP WITH TIME ZONE,
    subscription_end TIMESTAMP WITH TIME ZONE,
    total_paid INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all subscribers"
ON public.subscribers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage subscribers"
ON public.subscribers
FOR ALL
TO authenticated
USING (true);

-- Create view for admin analytics
CREATE OR REPLACE VIEW public.admin_analytics AS
SELECT 
    COUNT(DISTINCT p.user_id) as total_users,
    COUNT(DISTINCT s.user_id) as total_subscribers,
    COUNT(DISTINCT CASE WHEN s.subscribed = true THEN s.user_id END) as active_subscribers,
    COUNT(DISTINCT tr.user_id) as users_with_tests,
    COUNT(tr.id) as total_tests,
    SUM(s.total_paid) as total_revenue,
    COUNT(DISTINCT ol.user_id) as users_with_observations,
    COUNT(ol.id) as total_observations
FROM profiles p
LEFT JOIN subscribers s ON p.user_id = s.user_id
LEFT JOIN test_results tr ON p.user_id = tr.user_id
LEFT JOIN observation_logs ol ON p.user_id = ol.user_id;

-- Grant access to admins
GRANT SELECT ON public.admin_analytics TO authenticated;