-- Timeline activities table
CREATE TABLE public.timeline_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  member_id UUID NULL, -- NULL for family-wide activities
  type TEXT NOT NULL CHECK (type IN ('TEST', 'REPORT', 'NOTE', 'CONSULT', 'PAYMENT', 'SYSTEM')),
  title TEXT NOT NULL,
  summary TEXT,
  score_overall INTEGER CHECK (score_overall >= 0 AND score_overall <= 100),
  tags TEXT[] DEFAULT '{}',
  files JSONB DEFAULT '[]', -- [{url, type: "image"|"video"|"pdf", name}]
  actor JSONB NOT NULL DEFAULT '{"role": "user", "id": null, "name": null}', -- {role: "user"|"expert"|"system", id, name}
  meta JSONB DEFAULT '{}', -- additional metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Timeline sharing links table
CREATE TABLE public.timeline_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  family_id UUID NOT NULL,
  member_id UUID NULL, -- NULL for family-wide sharing
  created_by UUID NOT NULL, -- references profiles.id
  pin_code TEXT NOT NULL, -- 6-digit PIN
  permission TEXT NOT NULL CHECK (permission IN ('read', 'comment')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  who_user_id UUID NULL, -- references auth.users.id
  who_expert_id UUID NULL, -- for expert access via shared links
  action TEXT NOT NULL, -- 'view', 'comment', 'share', etc.
  target_timeline_id UUID NULL,
  target_share_id UUID NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expert comments table (extends timeline_activities but separate for clarity)
CREATE TABLE public.expert_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_activity_id UUID NOT NULL,
  expert_id UUID NOT NULL, -- references experts.id or can be NULL for shared link access
  comment_text TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false, -- if true, only visible to family
  created_via_share BOOLEAN NOT NULL DEFAULT false,
  share_id UUID NULL, -- if created via shared link
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timeline_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for timeline_activities
CREATE POLICY "Family members can view timeline activities"
ON public.timeline_activities
FOR SELECT
USING (
  family_id IN (
    SELECT fm.family_id
    FROM family_members fm
    JOIN profiles p ON fm.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Family members can create timeline activities"
ON public.timeline_activities
FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT fm.family_id
    FROM family_members fm
    JOIN profiles p ON fm.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Family members can update timeline activities"
ON public.timeline_activities
FOR UPDATE
USING (
  family_id IN (
    SELECT fm.family_id
    FROM family_members fm
    JOIN profiles p ON fm.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- RLS Policies for timeline_shares
CREATE POLICY "Family members can manage timeline shares"
ON public.timeline_shares
FOR ALL
USING (
  family_id IN (
    SELECT fm.family_id
    FROM family_members fm
    JOIN profiles p ON fm.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- RLS Policies for audit_logs
CREATE POLICY "Family members can view audit logs for their families"
ON public.audit_logs
FOR SELECT
USING (
  target_timeline_id IN (
    SELECT ta.id
    FROM timeline_activities ta
    WHERE ta.family_id IN (
      SELECT fm.family_id
      FROM family_members fm
      JOIN profiles p ON fm.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Anyone can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- RLS Policies for expert_comments
CREATE POLICY "Family members can view expert comments"
ON public.expert_comments
FOR SELECT
USING (
  timeline_activity_id IN (
    SELECT ta.id
    FROM timeline_activities ta
    WHERE ta.family_id IN (
      SELECT fm.family_id
      FROM family_members fm
      JOIN profiles p ON fm.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Experts can create comments"
ON public.expert_comments
FOR INSERT
WITH CHECK (true); -- Will be controlled by application logic

-- Create indexes for performance
CREATE INDEX idx_timeline_activities_family_id ON public.timeline_activities(family_id);
CREATE INDEX idx_timeline_activities_created_at ON public.timeline_activities(created_at DESC);
CREATE INDEX idx_timeline_activities_type ON public.timeline_activities(type);
CREATE INDEX idx_timeline_shares_share_id ON public.timeline_shares(share_id);
CREATE INDEX idx_timeline_shares_expires_at ON public.timeline_shares(expires_at);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_expert_comments_timeline_activity_id ON public.expert_comments(timeline_activity_id);

-- Update function for timeline_activities
CREATE OR REPLACE FUNCTION public.update_timeline_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timeline_activities_updated_at
  BEFORE UPDATE ON public.timeline_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timeline_activities_updated_at();