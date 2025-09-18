-- Fix institution_members table security issue
-- The table currently has inadequate RLS policies that may allow public access

-- First, drop the existing overly broad policy
DROP POLICY IF EXISTS "Institution admins can manage their members" ON public.institution_members;

-- Create granular policies for better security

-- Policy 1: Institution admins can view their own members
CREATE POLICY "Institution admins can view their members" 
ON public.institution_members 
FOR SELECT 
USING (auth.uid() = institution_admin_id);

-- Policy 2: Institution admins can insert new members
CREATE POLICY "Institution admins can insert members" 
ON public.institution_members 
FOR INSERT 
WITH CHECK (auth.uid() = institution_admin_id);

-- Policy 3: Institution admins can update their members
CREATE POLICY "Institution admins can update their members" 
ON public.institution_members 
FOR UPDATE 
USING (auth.uid() = institution_admin_id)
WITH CHECK (auth.uid() = institution_admin_id);

-- Policy 4: Institution admins can delete their members
CREATE POLICY "Institution admins can delete their members" 
ON public.institution_members 
FOR DELETE 
USING (auth.uid() = institution_admin_id);

-- Optional: Members can view their own data if they have an account
-- This policy allows users to see their own member record if member_user_id is linked
CREATE POLICY "Users can view their own member data" 
ON public.institution_members 
FOR SELECT 
USING (auth.uid() = member_user_id AND member_user_id IS NOT NULL);