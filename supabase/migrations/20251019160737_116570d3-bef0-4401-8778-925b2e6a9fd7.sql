-- Create enum for message types
CREATE TYPE message_type AS ENUM ('text', 'image', 'file');

-- Create enum for consultation session status
CREATE TYPE consultation_session_status AS ENUM ('waiting', 'active', 'ended');

-- Create real-time consultation sessions table
CREATE TABLE public.realtime_consultation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES public.experts(id) ON DELETE SET NULL,
  status consultation_session_status NOT NULL DEFAULT 'waiting',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create real-time messages table
CREATE TABLE public.realtime_consultation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.realtime_consultation_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type message_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  file_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.realtime_consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_consultation_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON public.realtime_consultation_sessions
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM public.experts WHERE id = expert_id)
  );

CREATE POLICY "Users can create their own sessions"
  ON public.realtime_consultation_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can update sessions"
  ON public.realtime_consultation_sessions
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM public.experts WHERE id = expert_id)
  );

-- RLS Policies for messages
CREATE POLICY "Users can view session messages"
  ON public.realtime_consultation_messages
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.realtime_consultation_sessions 
      WHERE user_id = auth.uid() OR 
            auth.uid() IN (SELECT user_id FROM public.experts WHERE id = expert_id)
    )
  );

CREATE POLICY "Users can send messages"
  ON public.realtime_consultation_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    session_id IN (
      SELECT id FROM public.realtime_consultation_sessions 
      WHERE user_id = auth.uid() OR 
            auth.uid() IN (SELECT user_id FROM public.experts WHERE id = expert_id)
    )
  );

CREATE POLICY "Users can update their messages"
  ON public.realtime_consultation_messages
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Enable realtime for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_consultation_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_consultation_sessions;

-- Create indexes for better performance
CREATE INDEX idx_realtime_sessions_user ON public.realtime_consultation_sessions(user_id);
CREATE INDEX idx_realtime_sessions_expert ON public.realtime_consultation_sessions(expert_id);
CREATE INDEX idx_realtime_messages_session ON public.realtime_consultation_messages(session_id);
CREATE INDEX idx_realtime_messages_created ON public.realtime_consultation_messages(created_at);