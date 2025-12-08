-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their own sessions" ON realtime_consultation_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON realtime_consultation_sessions;
DROP POLICY IF EXISTS "Experts can update sessions" ON realtime_consultation_sessions;
DROP POLICY IF EXISTS "Users can send messages" ON realtime_consultation_messages;
DROP POLICY IF EXISTS "Users can view session messages" ON realtime_consultation_messages;
DROP POLICY IF EXISTS "Users can update their messages" ON realtime_consultation_messages;

-- Create permissive policies for public access
CREATE POLICY "Anyone can create sessions" ON realtime_consultation_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view sessions" ON realtime_consultation_sessions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update sessions" ON realtime_consultation_sessions
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can send messages" ON realtime_consultation_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view messages" ON realtime_consultation_messages
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update messages" ON realtime_consultation_messages
  FOR UPDATE USING (true);