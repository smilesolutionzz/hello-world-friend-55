-- Check current RLS policies first
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('observation_logs', 'observation_sessions')
ORDER BY tablename, policyname;

-- Drop existing policies and recreate with better granular control
DO $$
BEGIN
    -- Drop existing policies for observation_logs
    DROP POLICY IF EXISTS "Users can manage their own observation logs" ON public.observation_logs;
    DROP POLICY IF EXISTS "Secure observation logs access" ON public.observation_logs;
    
    -- Drop existing policies for observation_sessions  
    DROP POLICY IF EXISTS "Users can manage their own observation sessions" ON public.observation_sessions;
    DROP POLICY IF EXISTS "Secure observation sessions access" ON public.observation_sessions;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors if policies don't exist
END $$;

-- Create security definer function for family member access control
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

-- Create granular policies for observation_logs
CREATE POLICY "observation_logs_select"
ON public.observation_logs
FOR SELECT
TO authenticated
USING (public.can_access_family_observation(user_id));

CREATE POLICY "observation_logs_insert"
ON public.observation_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "observation_logs_update"
ON public.observation_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "observation_logs_delete"
ON public.observation_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create granular policies for observation_sessions
CREATE POLICY "observation_sessions_select"
ON public.observation_sessions
FOR SELECT
TO authenticated
USING (public.can_access_family_observation(user_id));

CREATE POLICY "observation_sessions_insert"
ON public.observation_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "observation_sessions_update"
ON public.observation_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "observation_sessions_delete"
ON public.observation_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.observation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_sessions ENABLE ROW LEVEL SECURITY;

-- Add audit logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_observation_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log access to observation data for security monitoring
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (auth.uid(), 'observation_access', CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + 1;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for audit logging
DROP TRIGGER IF EXISTS observation_logs_access_audit ON public.observation_logs;
CREATE TRIGGER observation_logs_access_audit
  AFTER SELECT OR INSERT OR UPDATE OR DELETE
  ON public.observation_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.log_observation_access();

DROP TRIGGER IF EXISTS observation_sessions_access_audit ON public.observation_sessions;
CREATE TRIGGER observation_sessions_access_audit
  AFTER SELECT OR INSERT OR UPDATE OR DELETE
  ON public.observation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_observation_access();