-- Create family dynamics analysis tables
CREATE TABLE public.family_dynamics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  analysis_date DATE NOT NULL,
  family_wellness_index NUMERIC(4,2), -- 0.00-100.00
  dynamics_data JSONB NOT NULL, -- stores correlation analysis, influence patterns
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family member relationships with roles
CREATE TABLE public.family_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  relationship_type TEXT NOT NULL, -- 'parent', 'child', 'grandparent', 'sibling'
  generation INTEGER NOT NULL, -- 1=grandparents, 2=parents, 3=children
  influence_weight NUMERIC(3,2) DEFAULT 1.00, -- how much this person influences family dynamics
  stress_sensitivity NUMERIC(3,2) DEFAULT 1.00, -- how sensitive they are to family stress
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, profile_id)
);

-- Create family events tracking
CREATE TABLE public.family_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'academic_stress', 'job_change', 'moving', 'birth', 'death', 'illness'
  event_description TEXT,
  event_date DATE NOT NULL,
  impact_level INTEGER, -- 1-10 scale
  affected_members UUID[], -- array of profile_ids
  resolution_status TEXT DEFAULT 'ongoing', -- 'ongoing', 'resolved', 'escalated'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family intervention strategies
CREATE TABLE public.family_intervention_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  strategy_type TEXT NOT NULL, -- 'individual_counseling', 'family_therapy', 'group_activity', 'environmental_change'
  target_members UUID[], -- profile_ids who should participate
  intervention_order INTEGER, -- sequence of interventions
  predicted_effectiveness NUMERIC(3,2), -- 0.00-1.00
  strategy_content JSONB NOT NULL,
  status TEXT DEFAULT 'recommended', -- 'recommended', 'scheduled', 'in_progress', 'completed'
  effectiveness_score INTEGER, -- actual effectiveness 1-5 after completion
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emotional contagion tracking
CREATE TABLE public.emotional_contagion_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  source_member_id UUID NOT NULL, -- who influenced
  target_member_id UUID NOT NULL, -- who was influenced
  emotion_type TEXT NOT NULL, -- 'stress', 'anxiety', 'happiness', 'anger'
  influence_strength NUMERIC(3,2), -- 0.00-1.00
  time_delay_hours INTEGER, -- how long it took for influence to show
  detection_confidence NUMERIC(3,2), -- AI confidence in this correlation
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create three-generation analysis
CREATE TABLE public.generational_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  pattern_type TEXT NOT NULL, -- 'trauma_transmission', 'coping_mechanisms', 'communication_styles'
  pattern_description TEXT,
  generations_involved INTEGER[], -- [1,2,3] for which generations show this pattern
  pattern_strength NUMERIC(3,2), -- 0.00-1.00
  intervention_recommendations JSONB,
  last_analyzed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family wellness metrics
CREATE TABLE public.family_wellness_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  individual_scores JSONB NOT NULL, -- {profile_id: wellness_score}
  collective_harmony NUMERIC(3,2), -- how well family members are doing together
  communication_quality NUMERIC(3,2),
  stress_distribution NUMERIC(3,2), -- how evenly stress is distributed vs concentrated
  resilience_index NUMERIC(3,2), -- family's ability to bounce back
  overall_wellness_index NUMERIC(4,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, metric_date)
);

-- Enable Row Level Security
ALTER TABLE public.family_dynamics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_intervention_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_contagion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generational_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_wellness_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for family data access
CREATE POLICY "Family members can view family dynamics" 
ON public.family_dynamics 
FOR SELECT 
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Family members can view family relationships" 
ON public.family_relationships 
FOR SELECT 
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Family members can manage family events" 
ON public.family_events 
FOR ALL 
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Family members can view intervention strategies" 
ON public.family_intervention_strategies 
FOR SELECT 
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Family members can view emotional contagion" 
ON public.emotional_contagion_logs 
FOR SELECT 
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Family members can view generational patterns" 
ON public.generational_patterns 
FOR SELECT 
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Family members can view wellness metrics" 
ON public.family_wellness_metrics 
FOR SELECT 
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

-- Allow system to insert analysis data
CREATE POLICY "System can insert family dynamics" 
ON public.family_dynamics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can insert intervention strategies" 
ON public.family_intervention_strategies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can insert emotional contagion logs" 
ON public.emotional_contagion_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can insert generational patterns" 
ON public.generational_patterns 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can insert wellness metrics" 
ON public.family_wellness_metrics 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_family_dynamics_family_date ON public.family_dynamics(family_id, analysis_date DESC);
CREATE INDEX idx_family_relationships_family ON public.family_relationships(family_id);
CREATE INDEX idx_family_events_family_date ON public.family_events(family_id, event_date DESC);
CREATE INDEX idx_intervention_strategies_family ON public.family_intervention_strategies(family_id);
CREATE INDEX idx_emotional_contagion_family_time ON public.emotional_contagion_logs(family_id, timestamp DESC);
CREATE INDEX idx_generational_patterns_family ON public.generational_patterns(family_id);
CREATE INDEX idx_wellness_metrics_family_date ON public.family_wellness_metrics(family_id, metric_date DESC);