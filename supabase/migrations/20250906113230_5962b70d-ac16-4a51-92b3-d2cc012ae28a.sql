-- 🔧 Fix personalized_missions RLS policy issues
-- This fixes the problematic RLS policies that were blocking insertions

-- Fix personalized missions policies to allow proper insertions
DROP POLICY IF EXISTS "Users can view their own missions" ON public.personalized_missions;
DROP POLICY IF EXISTS "Users can update their own missions" ON public.personalized_missions;
DROP POLICY IF EXISTS "System can insert missions for users" ON public.personalized_missions;

-- Create proper policies for personalized missions
CREATE POLICY "Users can view their own missions" 
ON public.personalized_missions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions" 
ON public.personalized_missions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow system/service role to create missions for users
CREATE POLICY "System can insert missions for users" 
ON public.personalized_missions 
FOR INSERT 
WITH CHECK (
  -- Allow service role to insert missions
  (auth.jwt() ->> 'role'::text) = 'service_role'::text
  OR 
  -- Allow users to create their own missions
  auth.uid() = user_id
);

-- Allow admin to manage all missions
CREATE POLICY "Admins can manage all missions" 
ON public.personalized_missions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));