-- Helper: check if current user can access a realtime topic
CREATE OR REPLACE FUNCTION public.can_access_realtime_topic(_topic text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _id text;
  _uuid uuid;
BEGIN
  IF _uid IS NULL THEN
    RETURN false;
  END IF;

  -- chat-{sessionId}: owner or assigned expert of consultation session
  IF _topic LIKE 'chat-%' THEN
    _id := substring(_topic from 6);
    BEGIN
      _uuid := _id::uuid;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    RETURN EXISTS (
      SELECT 1 FROM public.realtime_consultation_sessions s
      WHERE s.id = _uuid
        AND (s.user_id = _uid OR s.expert_id = _uid)
    );
  END IF;

  -- group_speaker:{groupSessionId}: participant of group session
  IF _topic LIKE 'group_speaker:%' THEN
    _id := substring(_topic from 15);
    BEGIN
      _uuid := _id::uuid;
    EXCEPTION WHEN others THEN
      RETURN false;
    END;
    RETURN public.is_session_participant(_uuid);
  END IF;

  -- room:{roomId}: open to any authenticated user (metaverse lobby)
  IF _topic LIKE 'room:%' THEN
    RETURN true;
  END IF;

  -- Default deny for unknown sensitive topics
  RETURN false;
END;
$$;

-- Enable RLS on realtime.messages and add an authorization policy
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can subscribe to authorized topics" ON realtime.messages;

CREATE POLICY "Authenticated users can subscribe to authorized topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  public.can_access_realtime_topic((realtime.topic())::text)
);

DROP POLICY IF EXISTS "Authenticated users can broadcast to authorized topics" ON realtime.messages;

CREATE POLICY "Authenticated users can broadcast to authorized topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_access_realtime_topic((realtime.topic())::text)
);