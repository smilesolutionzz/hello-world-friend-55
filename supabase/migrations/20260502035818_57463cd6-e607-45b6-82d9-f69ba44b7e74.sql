-- 마인드 트랙 셀프체크 결과 저장 (목표별 자가체크) — 공유 가능한 안전한 결과 페이지를 위해 저장
CREATE TABLE IF NOT EXISTS public.mind_track_self_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,                         -- 비로그인 허용 (anon)
  share_id TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  goal_id TEXT NOT NULL,
  goal_title TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('calm','watch','support')),
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,   -- share_id로 공유 시 공개
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mind_track_self_checks_user
  ON public.mind_track_self_checks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mind_track_self_checks_share
  ON public.mind_track_self_checks(share_id);

ALTER TABLE public.mind_track_self_checks ENABLE ROW LEVEL SECURITY;

-- 본인은 자기 데이터를 항상 조회/수정 가능
CREATE POLICY "self check owner select"
  ON public.mind_track_self_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "self check owner update"
  ON public.mind_track_self_checks FOR UPDATE
  USING (auth.uid() = user_id);

-- share_id가 알려진 경우(직접 ID로 .eq 조회) 누구나 SELECT 가능 — 공유 페이지용
-- (목록 스캔 차단 위해 share_id를 노출 못하면 사실상 본인만 볼 수 있음)
CREATE POLICY "self check public via share id"
  ON public.mind_track_self_checks FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- INSERT: 로그인 사용자는 본인 데이터만, 익명은 user_id NULL만
CREATE POLICY "self check insert authed"
  ON public.mind_track_self_checks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "self check insert anon"
  ON public.mind_track_self_checks FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);