-- 메타버스 일기 작성 테이블
CREATE TABLE IF NOT EXISTS public.metaverse_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  mood_before INTEGER,
  mood_after INTEGER,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.metaverse_journals ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 일기만 조회/작성/수정
CREATE POLICY "Users can view their own journals"
  ON public.metaverse_journals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journals"
  ON public.metaverse_journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals"
  ON public.metaverse_journals FOR UPDATE
  USING (auth.uid() = user_id);

-- 그룹 상담 세션 테이블
CREATE TABLE IF NOT EXISTS public.group_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  host_user_id UUID NOT NULL,
  room_type TEXT NOT NULL,
  max_participants INTEGER DEFAULT 6,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성 세션 조회 가능
CREATE POLICY "Anyone can view active sessions"
  ON public.group_sessions FOR SELECT
  USING (is_active = true);

-- 사용자는 자신의 세션 생성 가능
CREATE POLICY "Users can create sessions"
  ON public.group_sessions FOR INSERT
  WITH CHECK (auth.uid() = host_user_id);

-- 호스트만 세션 업데이트 가능
CREATE POLICY "Hosts can update their sessions"
  ON public.group_sessions FOR UPDATE
  USING (auth.uid() = host_user_id);

-- 그룹 참가자 테이블
CREATE TABLE IF NOT EXISTS public.group_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.group_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  avatar_url TEXT,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT -1.5,
  position_z FLOAT DEFAULT 3,
  is_speaking BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.group_participants ENABLE ROW LEVEL SECURITY;

-- 세션 참가자는 같은 세션의 다른 참가자 정보 조회 가능
CREATE POLICY "Session participants can view each other"
  ON public.group_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_participants AS gp
      WHERE gp.session_id = group_participants.session_id
      AND gp.user_id = auth.uid()
    )
  );

-- 사용자는 세션에 참여 가능
CREATE POLICY "Users can join sessions"
  ON public.group_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 참가자는 자신의 정보 업데이트 가능
CREATE POLICY "Participants can update their own info"
  ON public.group_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- 참가자는 세션 퇴장 가능
CREATE POLICY "Participants can leave sessions"
  ON public.group_participants FOR DELETE
  USING (auth.uid() = user_id);

-- 공간 꾸미기 테이블
CREATE TABLE IF NOT EXISTS public.room_decorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  room_type TEXT NOT NULL,
  item_type TEXT NOT NULL, -- 'furniture', 'plant', 'picture', etc.
  item_id TEXT NOT NULL,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  position_z FLOAT NOT NULL,
  rotation_y FLOAT DEFAULT 0,
  scale FLOAT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.room_decorations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own decorations"
  ON public.room_decorations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create decorations"
  ON public.room_decorations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their decorations"
  ON public.room_decorations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their decorations"
  ON public.room_decorations FOR DELETE
  USING (auth.uid() = user_id);

-- 업데이트 타임스탬프 트리거
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metaverse_journals_updated_at
  BEFORE UPDATE ON public.metaverse_journals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_participants;
ALTER TABLE public.group_participants REPLICA IDENTITY FULL;