-- Drop all existing RLS policies first
DROP POLICY IF EXISTS "Users can view public sessions and their own sessions" ON public.metaverse_sessions;
DROP POLICY IF EXISTS "Users can create metaverse sessions" ON public.metaverse_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.metaverse_sessions;
DROP POLICY IF EXISTS "Users can view their own metaverse sessions" ON public.metaverse_sessions;
DROP POLICY IF EXISTS "Users can view session participants" ON public.session_participants;
DROP POLICY IF EXISTS "Users can join sessions" ON public.session_participants;

-- Create simplified, non-recursive RLS policies for metaverse_sessions
CREATE POLICY "Public sessions are viewable by all"
ON public.metaverse_sessions
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view their own sessions"
ON public.metaverse_sessions
FOR SELECT
USING (host_profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create sessions"
ON public.metaverse_sessions
FOR INSERT
WITH CHECK (host_profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update own sessions"
ON public.metaverse_sessions
FOR UPDATE
USING (host_profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Create RLS policies for session_participants
CREATE POLICY "Anyone can view session participants"
ON public.session_participants
FOR SELECT
USING (true);

CREATE POLICY "Users can join as participants"
ON public.session_participants
FOR INSERT
WITH CHECK (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));