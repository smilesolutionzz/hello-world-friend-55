-- Create organization-related tables for B2B EAP system

-- Organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  size_category TEXT NOT NULL CHECK (size_category IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  employee_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  admin_profile_id UUID NOT NULL,
  subscription_plan TEXT DEFAULT 'basic',
  settings JSONB DEFAULT '{}'::jsonb
);

-- Departments within organizations
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  head_profile_id UUID,
  employee_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee profiles linked to organizations
CREATE TABLE public.employee_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  department_id UUID,
  position TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('entry', 'junior', 'senior', 'lead', 'manager', 'director', 'executive')),
  years_of_experience INTEGER DEFAULT 0,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'remote')),
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Organizational wellness metrics
CREATE TABLE public.organizational_wellness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  overall_wellness_score NUMERIC(4,2),
  department_scores JSONB NOT NULL DEFAULT '{}',
  level_scores JSONB NOT NULL DEFAULT '{}',
  burnout_risk_count INTEGER DEFAULT 0,
  high_stress_count INTEGER DEFAULT 0,
  employee_satisfaction NUMERIC(4,2),
  turnover_risk_score NUMERIC(4,2),
  team_cohesion_score NUMERIC(4,2),
  productivity_index NUMERIC(4,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee stress and wellness tracking
CREATE TABLE public.employee_wellness_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID NOT NULL,
  tracking_date DATE NOT NULL,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  burnout_score NUMERIC(4,2),
  job_satisfaction INTEGER CHECK (job_satisfaction BETWEEN 1 AND 10),
  work_life_balance INTEGER CHECK (work_life_balance BETWEEN 1 AND 10),
  team_satisfaction INTEGER CHECK (team_satisfaction BETWEEN 1 AND 10),
  turnover_intention INTEGER CHECK (turnover_intention BETWEEN 1 AND 10),
  productivity_self_rating INTEGER CHECK (productivity_self_rating BETWEEN 1 AND 10),
  wellness_factors JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_profile_id, tracking_date)
);

-- Team dynamics and conflict prediction
CREATE TABLE public.team_dynamics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL,
  analysis_date DATE NOT NULL,
  team_harmony_score NUMERIC(4,2),
  conflict_risk_level TEXT CHECK (conflict_risk_level IN ('low', 'medium', 'high', 'critical')),
  communication_quality NUMERIC(4,2),
  collaboration_effectiveness NUMERIC(4,2),
  leadership_satisfaction NUMERIC(4,2),
  stress_propagation_risk NUMERIC(4,2),
  intervention_recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Corporate intervention programs
CREATE TABLE public.corporate_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  program_type TEXT NOT NULL,
  target_demographic JSONB NOT NULL,
  program_content JSONB NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  participants_count INTEGER DEFAULT 0,
  completion_rate NUMERIC(4,2),
  effectiveness_score NUMERIC(4,2),
  roi_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ROI and business impact tracking
CREATE TABLE public.business_impact_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  metric_period_start DATE NOT NULL,
  metric_period_end DATE NOT NULL,
  wellness_investment_amount NUMERIC(12,2),
  productivity_improvement_percent NUMERIC(5,2),
  turnover_rate_before NUMERIC(5,2),
  turnover_rate_after NUMERIC(5,2),
  absenteeism_reduction_percent NUMERIC(5,2),
  employee_satisfaction_improvement NUMERIC(5,2),
  estimated_cost_savings NUMERIC(12,2),
  roi_percentage NUMERIC(6,2),
  additional_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_wellness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_wellness_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_dynamics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_impact_metrics ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Organization admins can manage their organization" 
ON public.organizations 
FOR ALL 
USING (admin_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Organization members can view their organization" 
ON public.organizations 
FOR SELECT 
USING (id IN (SELECT organization_id FROM employee_profiles ep JOIN profiles p ON ep.profile_id = p.id WHERE p.user_id = auth.uid()));

-- Departments policies
CREATE POLICY "Organization members can view departments" 
ON public.departments 
FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM employee_profiles ep JOIN profiles p ON ep.profile_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY "Organization admins can manage departments" 
ON public.departments 
FOR ALL 
USING (organization_id IN (SELECT id FROM organizations WHERE admin_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Employee profiles policies
CREATE POLICY "Organization members can view employee profiles" 
ON public.employee_profiles 
FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM employee_profiles ep JOIN profiles p ON ep.profile_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY "Organization admins can manage employee profiles" 
ON public.employee_profiles 
FOR ALL 
USING (organization_id IN (SELECT id FROM organizations WHERE admin_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Organizational wellness policies
CREATE POLICY "Organization members can view wellness metrics" 
ON public.organizational_wellness 
FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM employee_profiles ep JOIN profiles p ON ep.profile_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY "System can insert organizational wellness" 
ON public.organizational_wellness 
FOR INSERT 
WITH CHECK (true);

-- Employee wellness tracking policies
CREATE POLICY "Employees can manage their own wellness tracking" 
ON public.employee_wellness_tracking 
FOR ALL 
USING (employee_profile_id IN (SELECT ep.id FROM employee_profiles ep JOIN profiles p ON ep.profile_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY "Organization admins can view employee wellness (anonymized)" 
ON public.employee_wellness_tracking 
FOR SELECT 
USING (employee_profile_id IN (SELECT ep.id FROM employee_profiles ep WHERE ep.organization_id IN (SELECT id FROM organizations WHERE admin_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))));

-- Team dynamics policies
CREATE POLICY "Organization members can view team dynamics" 
ON public.team_dynamics 
FOR SELECT 
USING (department_id IN (SELECT d.id FROM departments d JOIN employee_profiles ep ON d.organization_id = ep.organization_id JOIN profiles p ON ep.profile_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY "System can insert team dynamics" 
ON public.team_dynamics 
FOR INSERT 
WITH CHECK (true);

-- Corporate programs policies
CREATE POLICY "Organization members can view corporate programs" 
ON public.corporate_programs 
FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM employee_profiles ep JOIN profiles p ON ep.profile_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY "Organization admins can manage corporate programs" 
ON public.corporate_programs 
FOR ALL 
USING (organization_id IN (SELECT id FROM organizations WHERE admin_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Business impact metrics policies
CREATE POLICY "Organization admins can manage impact metrics" 
ON public.business_impact_metrics 
FOR ALL 
USING (organization_id IN (SELECT id FROM organizations WHERE admin_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Create indexes for performance
CREATE INDEX idx_organizations_admin ON organizations(admin_profile_id);
CREATE INDEX idx_departments_org ON departments(organization_id);
CREATE INDEX idx_employee_profiles_org ON employee_profiles(organization_id);
CREATE INDEX idx_employee_profiles_profile ON employee_profiles(profile_id);
CREATE INDEX idx_organizational_wellness_org_date ON organizational_wellness(organization_id, metric_date);
CREATE INDEX idx_employee_wellness_tracking_emp_date ON employee_wellness_tracking(employee_profile_id, tracking_date);
CREATE INDEX idx_team_dynamics_dept_date ON team_dynamics(department_id, analysis_date);
CREATE INDEX idx_corporate_programs_org ON corporate_programs(organization_id);
CREATE INDEX idx_business_impact_org_period ON business_impact_metrics(organization_id, metric_period_start, metric_period_end);

-- Create trigger for updating organizations updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();