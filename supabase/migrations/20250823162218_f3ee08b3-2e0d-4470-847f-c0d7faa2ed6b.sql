-- First, let's check the current state of RLS on observation tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('observation_logs', 'observation_sessions');

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('observation_logs', 'observation_sessions');

-- Now let's strengthen the RLS policies with more granular access control

-- For observation_logs: ensure proper user isolation
DROP POLICY IF EXISTS "Users can manage their own observation logs" ON public.observation_logs;

CREATE POLICY "Users can view their own observation logs"
ON public.observation_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own observation logs"
ON public.observation_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own observation logs"
ON public.observation_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observation logs"
ON public.observation_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- For observation_sessions: ensure proper user isolation
DROP POLICY IF EXISTS "Users can manage their own observation sessions" ON public.observation_sessions;

CREATE POLICY "Users can view their own observation sessions"
ON public.observation_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own observation sessions"
ON public.observation_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own observation sessions"
ON public.observation_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observation sessions"
ON public.observation_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add additional security measures for family member access
-- Create a security definer function to check family member access
CREATE OR REPLACE FUNCTION public.can_access_family_observation(observation_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    observation_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM public.family_members fm 
      WHERE fm.user_id = auth.uid() 
        AND fm.family_id IN (
          SELECT fm2.family_id 
          FROM public.family_members fm2 
          WHERE fm2.user_id = observation_user_id
        )
    );
$$;

-- Enhanced policies for observation_logs with family access
DROP POLICY IF EXISTS "Users can view their own observation logs" ON public.observation_logs;
DROP POLICY IF EXISTS "Users can insert their own observation logs" ON public.observation_logs;
DROP POLICY IF EXISTS "Users can update their own observation logs" ON public.observation_logs;
DROP POLICY IF EXISTS "Users can delete their own observation logs" ON public.observation_logs;

CREATE POLICY "Secure observation logs access"
ON public.observation_logs
FOR ALL
TO authenticated
USING (public.can_access_family_observation(user_id))
WITH CHECK (auth.uid() = user_id);

-- Enhanced policies for observation_sessions with family access
DROP POLICY IF EXISTS "Users can view their own observation sessions" ON public.observation_sessions;
DROP POLICY IF EXISTS "Users can insert their own observation sessions" ON public.observation_sessions;
DROP POLICY IF EXISTS "Users can update their own observation sessions" ON public.observation_sessions;
DROP POLICY IF EXISTS "Users can delete their own observation sessions" ON public.observation_sessions;

CREATE POLICY "Secure observation sessions access"
ON public.observation_sessions
FOR ALL
TO authenticated
USING (public.can_access_family_observation(user_id))
WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.observation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_sessions ENABLE ROW LEVEL SECURITY;