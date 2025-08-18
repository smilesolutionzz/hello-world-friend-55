-- Create chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assessment_results JSONB,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'assessment_share')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view their own chat rooms" 
ON public.chat_rooms 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = expert_id);

CREATE POLICY "Users can create their own chat rooms" 
ON public.chat_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat rooms" 
ON public.chat_rooms 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = expert_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their rooms" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE chat_rooms.id = chat_messages.room_id 
    AND (chat_rooms.user_id = auth.uid() OR chat_rooms.expert_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their rooms" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE chat_rooms.id = chat_messages.room_id 
    AND (chat_rooms.user_id = auth.uid() OR chat_rooms.expert_id = auth.uid())
  )
);

-- Add updated_at trigger for chat_rooms
CREATE TRIGGER update_chat_rooms_updated_at
BEFORE UPDATE ON public.chat_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;

-- Set replica identity for realtime
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;