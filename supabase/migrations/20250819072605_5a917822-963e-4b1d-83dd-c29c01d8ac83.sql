-- Fix infinite recursion in metaverse_sessions RLS policies
DROP POLICY IF EXISTS "Users can view their own metaverse sessions" ON public.metaverse_sessions;
DROP POLICY IF EXISTS "Users can create metaverse sessions" ON public.metaverse_sessions;
DROP POLICY IF EXISTS "Users can update their own metaverse sessions" ON public.metaverse_sessions;

-- Create new, simplified RLS policies
CREATE POLICY "Users can view public sessions and their own sessions"
ON public.metaverse_sessions
FOR SELECT
USING (
  is_public = true 
  OR host_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create metaverse sessions"
ON public.metaverse_sessions
FOR INSERT
WITH CHECK (
  host_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own sessions"
ON public.metaverse_sessions
FOR UPDATE
USING (
  host_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Add missing policies for session_participants
CREATE POLICY "Users can view session participants"
ON public.session_participants
FOR SELECT
USING (
  session_id IN (
    SELECT id FROM metaverse_sessions 
    WHERE is_public = true 
    OR host_profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  OR profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join sessions"
ON public.session_participants
FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);