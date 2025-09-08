-- Create expert applications table for managing expert signup requests
CREATE TABLE public.expert_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  application_status TEXT NOT NULL DEFAULT 'pending',
  
  -- 기본 정보
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  address TEXT,
  
  -- 전문 분야
  specializations TEXT[] NOT NULL DEFAULT '{}',
  consultation_methods TEXT[] NOT NULL DEFAULT '{}',
  target_age_groups TEXT[] NOT NULL DEFAULT '{}',
  
  -- 자격증 및 경력
  license_number TEXT,
  certifications TEXT[] DEFAULT '{}',
  education_background TEXT[] DEFAULT '{}',
  work_experience JSONB DEFAULT '[]',
  
  -- 상담 정보
  years_experience INTEGER NOT NULL DEFAULT 0,
  hourly_rate INTEGER,
  bio TEXT,
  
  -- 첨부 파일
  profile_image_url TEXT,
  certificate_files TEXT[] DEFAULT '{}',
  portfolio_files TEXT[] DEFAULT '{}',
  
  -- 신청 관련
  application_reason TEXT,
  terms_agreed BOOLEAN NOT NULL DEFAULT false,
  privacy_agreed BOOLEAN NOT NULL DEFAULT false,
  
  -- 관리자 검토
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own applications" 
ON public.expert_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications" 
ON public.expert_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their pending applications" 
ON public.expert_applications 
FOR UPDATE 
USING (auth.uid() = user_id AND application_status = 'pending');

CREATE POLICY "Admins can view all applications" 
ON public.expert_applications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update applications" 
ON public.expert_applications 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update timestamp trigger
CREATE TRIGGER update_expert_applications_updated_at
  BEFORE UPDATE ON public.expert_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();