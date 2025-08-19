-- 메타버스 세션 초대 테이블 생성
CREATE TABLE public.metaverse_session_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.metaverse_sessions(id) ON DELETE CASCADE,
  inviter_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invitee_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitation_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'base64url'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- RLS 정책 활성화
ALTER TABLE public.metaverse_session_invitations ENABLE ROW LEVEL SECURITY;

-- 초대자는 자신이 보낸 초대 보기 가능
CREATE POLICY "Users can view their sent invitations"
ON public.metaverse_session_invitations
FOR SELECT
USING (inviter_profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- 초대받은 사람은 자신의 초대 보기 가능
CREATE POLICY "Users can view their received invitations"
ON public.metaverse_session_invitations
FOR SELECT
USING (
  invitee_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ) OR 
  invitee_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- 초대 생성 권한
CREATE POLICY "Session hosts can create invitations"
ON public.metaverse_session_invitations
FOR INSERT
WITH CHECK (
  inviter_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ) AND
  session_id IN (
    SELECT id FROM metaverse_sessions 
    WHERE host_profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- 초대 수락/거절 권한
CREATE POLICY "Users can update their received invitations"
ON public.metaverse_session_invitations
FOR UPDATE
USING (
  invitee_profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ) OR 
  invitee_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- 인덱스 생성
CREATE INDEX idx_session_invitations_session ON metaverse_session_invitations(session_id);
CREATE INDEX idx_session_invitations_inviter ON metaverse_session_invitations(inviter_profile_id);
CREATE INDEX idx_session_invitations_invitee ON metaverse_session_invitations(invitee_profile_id);
CREATE INDEX idx_session_invitations_code ON metaverse_session_invitations(invitation_code);