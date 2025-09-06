-- Fix critical security vulnerability in consultations table
-- Ensure only patient and assigned therapist can access therapy session data

-- First, let's strengthen the existing policies and add additional security checks

-- Drop existing policies to recreate them with stronger security
DROP POLICY IF EXISTS "Users can view their own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can create consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users and experts can update their consultations" ON public.consultations;

-- Create highly secure RLS policies for consultations

-- SELECT Policy: Only patient or assigned therapist can view consultations
CREATE POLICY "Strict consultation access - patient and therapist only" ON public.consultations
FOR SELECT USING (
  -- Patient can view their own consultations
  auth.uid() = user_id 
  OR 
  -- Assigned therapist can view consultations where they are the expert
  (
    auth.uid() IS NOT NULL AND
    expert_id IN (
      SELECT e.id 
      FROM experts e 
      WHERE e.user_id = auth.uid() 
        AND e.is_verified = true
    )
  )
);

-- INSERT Policy: Only authenticated users can create consultations for themselves
CREATE POLICY "Users can create their own consultations only" ON public.consultations
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  auth.uid() IS NOT NULL AND
  -- Ensure the expert_id references a verified expert
  expert_id IN (
    SELECT id FROM experts WHERE is_verified = true AND is_available = true
  )
);

-- UPDATE Policy: Strict updates - patients can update limited fields, therapists can add notes
CREATE POLICY "Restricted consultation updates" ON public.consultations
FOR UPDATE USING (
  -- Patient can update their own consultations (limited fields via application logic)
  auth.uid() = user_id 
  OR 
  -- Therapist can update consultations they are assigned to
  (
    auth.uid() IS NOT NULL AND
    expert_id IN (
      SELECT e.id 
      FROM experts e 
      WHERE e.user_id = auth.uid() 
        AND e.is_verified = true
    )
  )
) WITH CHECK (
  -- Ensure the same access control for the updated record
  auth.uid() = user_id 
  OR 
  (
    auth.uid() IS NOT NULL AND
    expert_id IN (
      SELECT e.id 
      FROM experts e 
      WHERE e.user_id = auth.uid() 
        AND e.is_verified = true
    )
  )
);

-- DELETE Policy: No one can delete consultations (data retention for legal/medical requirements)
-- This is intentionally restrictive for therapy session data
CREATE POLICY "No consultation deletion allowed" ON public.consultations
FOR DELETE USING (false);

-- Add additional security function to verify consultation access
CREATE OR REPLACE FUNCTION public.verify_consultation_access(consultation_id uuid, requesting_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM consultations c
    LEFT JOIN experts e ON c.expert_id = e.id
    WHERE c.id = consultation_id
      AND (
        c.user_id = requesting_user_id OR 
        (e.user_id = requesting_user_id AND e.is_verified = true)
      )
  );
$$;

-- Create audit log for consultation access (for compliance)
CREATE TABLE IF NOT EXISTS public.consultation_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL,
  accessed_by uuid NOT NULL,
  access_type text NOT NULL, -- 'read', 'write', 'create'
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.consultation_access_log ENABLE ROW LEVEL SECURITY;

-- Only system/admin can view audit logs
CREATE POLICY "Admin only consultation audit access" ON public.consultation_access_log
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.verify_consultation_access(uuid, uuid) TO authenticated;