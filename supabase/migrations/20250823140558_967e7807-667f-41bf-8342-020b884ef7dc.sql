-- 채팅방에 전문가 ID 추가
ALTER TABLE public.chat_rooms 
ADD COLUMN IF NOT EXISTS expert_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 채팅방 상태 체크 제약조건 업데이트 (기존에 있는지 확인 후 추가)
DO $$ 
BEGIN
    -- 기존 체크 제약조건이 있으면 제거
    ALTER TABLE public.chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_status_check;
    
    -- 새로운 체크 제약조건 추가
    ALTER TABLE public.chat_rooms 
    ADD CONSTRAINT chat_rooms_status_check 
    CHECK (status IN ('waiting', 'active', 'ended'));
END $$;

-- 메시지 타입 체크 제약조건 업데이트
DO $$ 
BEGIN
    -- 기존 체크 제약조건이 있으면 제거
    ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
    
    -- 새로운 체크 제약조건 추가
    ALTER TABLE public.chat_messages 
    ADD CONSTRAINT chat_messages_message_type_check 
    CHECK (message_type IN ('text', 'system', 'assessment_share'));
END $$;

-- 새로운 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_chat_rooms_expert_id ON public.chat_rooms(expert_id);

-- RLS 정책 업데이트 (전문가도 채팅방에 접근할 수 있도록)
DROP POLICY IF EXISTS "Users can view their own chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can update their own chat rooms" ON public.chat_rooms;

CREATE POLICY "Users can view their own chat rooms" ON public.chat_rooms
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = expert_id);

CREATE POLICY "Users can update their own chat rooms" ON public.chat_rooms
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = expert_id);

-- 메시지 RLS 정책도 업데이트
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their rooms" ON public.chat_messages;

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