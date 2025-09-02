-- Create institution premium plans table
CREATE TABLE public.institution_premium_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.partner_institutions(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'standard', 'premium')),
  plan_name TEXT NOT NULL,
  monthly_price INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institution_premium_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Institutions can view their own premium plans"
ON public.institution_premium_plans
FOR SELECT
USING (
  institution_id IN (
    SELECT id FROM public.partner_institutions 
    WHERE partnership_status = 'active'
  )
);

CREATE POLICY "Admins can manage all premium plans"
ON public.institution_premium_plans
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create institution premium features table
CREATE TABLE public.institution_premium_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.partner_institutions(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN (
    'priority_listing', 'featured_badge', 'analytics_dashboard', 
    'custom_profile', 'virtual_tour', 'priority_matching',
    'marketing_tools', 'dedicated_manager'
  )),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER DEFAULT -1, -- -1 means unlimited
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id, feature_type)
);

-- Enable RLS
ALTER TABLE public.institution_premium_features ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Institutions can view their own premium features"
ON public.institution_premium_features
FOR SELECT
USING (
  institution_id IN (
    SELECT id FROM public.partner_institutions 
    WHERE partnership_status = 'active'
  )
);

CREATE POLICY "Admins can manage all premium features"
ON public.institution_premium_features
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create institution analytics table
CREATE TABLE public.institution_premium_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.partner_institutions(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  page_views INTEGER DEFAULT 0,
  profile_clicks INTEGER DEFAULT 0,
  contact_requests INTEGER DEFAULT 0,
  consultation_bookings INTEGER DEFAULT 0,
  search_appearances INTEGER DEFAULT 0,
  search_rankings JSONB DEFAULT '{}'::jsonb,
  conversion_rate NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id, date)
);

-- Enable RLS
ALTER TABLE public.institution_premium_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Institutions can view their own analytics"
ON public.institution_premium_analytics
FOR SELECT
USING (
  institution_id IN (
    SELECT id FROM public.partner_institutions 
    WHERE partnership_status = 'active'
  )
);

-- Create index for performance
CREATE INDEX idx_institution_premium_plans_institution_id ON public.institution_premium_plans(institution_id);
CREATE INDEX idx_institution_premium_plans_plan_type ON public.institution_premium_plans(plan_type);
CREATE INDEX idx_institution_premium_features_institution_id ON public.institution_premium_features(institution_id);
CREATE INDEX idx_institution_premium_features_feature_type ON public.institution_premium_features(feature_type);
CREATE INDEX idx_institution_premium_analytics_institution_id ON public.institution_premium_analytics(institution_id);
CREATE INDEX idx_institution_premium_analytics_date ON public.institution_premium_analytics(date);

-- Create trigger for updated_at
CREATE TRIGGER update_institution_premium_plans_updated_at
BEFORE UPDATE ON public.institution_premium_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institution_premium_features_updated_at
BEFORE UPDATE ON public.institution_premium_features
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default premium plan types
INSERT INTO public.institution_premium_plans (institution_id, plan_type, plan_name, monthly_price, features) 
SELECT 
  id,
  'basic',
  '기본 플랜',
  0,
  '["basic_listing", "basic_profile", "standard_support"]'::jsonb
FROM public.partner_institutions 
WHERE partnership_status = 'active'
ON CONFLICT DO NOTHING;

-- Sample premium features for institutions that want to upgrade
INSERT INTO public.institution_premium_features (institution_id, feature_type, is_enabled)
SELECT 
  id,
  unnest(ARRAY['priority_listing', 'featured_badge', 'analytics_dashboard', 'custom_profile']),
  false
FROM public.partner_institutions 
WHERE partnership_status = 'active'
ON CONFLICT (institution_id, feature_type) DO NOTHING;