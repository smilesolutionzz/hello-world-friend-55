-- 채팅방 테이블 생성
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  assessment_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- 채팅 메시지 테이블 생성
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'assessment_share')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 채팅방 RLS 정책
CREATE POLICY "Users can view their own chat rooms" ON public.chat_rooms
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = expert_id);

CREATE POLICY "Users can create their own chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat rooms" ON public.chat_rooms
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = expert_id);

-- 채팅 메시지 RLS 정책
CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user_id = auth.uid() OR chat_rooms.expert_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their rooms" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user_id = auth.uid() OR chat_rooms.expert_id = auth.uid())
    )
    AND auth.uid() = sender_id
  );

-- 인덱스 생성
CREATE INDEX idx_chat_rooms_user_id ON public.chat_rooms(user_id);
CREATE INDEX idx_chat_rooms_expert_id ON public.chat_rooms(expert_id);
CREATE INDEX idx_chat_rooms_status ON public.chat_rooms(status);
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();