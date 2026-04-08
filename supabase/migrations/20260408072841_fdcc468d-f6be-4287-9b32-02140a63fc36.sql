-- 1) 리포트 공유 링크 테이블
CREATE TABLE public.report_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_history_id UUID REFERENCES public.premium_report_history(id) ON DELETE SET NULL,
  share_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  share_type TEXT NOT NULL DEFAULT 'permanent' CHECK (share_type IN ('permanent', 'temporary', 'one_time')),
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) 공유 링크에 포함되는 리포트 목록 (회차별 네비게이션)
CREATE TABLE public.report_share_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID NOT NULL REFERENCES public.report_share_links(id) ON DELETE CASCADE,
  report_history_id UUID NOT NULL REFERENCES public.premium_report_history(id) ON DELETE CASCADE,
  report_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(share_link_id, report_history_id)
);

-- 3) 열람 로그
CREATE TABLE public.report_share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID NOT NULL REFERENCES public.report_share_links(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewer_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- 4) premium_report_history에 공유 관련 컬럼 추가
ALTER TABLE public.premium_report_history
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- 5) RLS 설정
ALTER TABLE public.report_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_share_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_share_views ENABLE ROW LEVEL SECURITY;

-- 소유자만 자기 링크 관리
CREATE POLICY "Users manage own share links"
  ON public.report_share_links FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 공개 열람: 토큰으로 조회 (비로그인 포함)
CREATE POLICY "Anyone can view active share links by token"
  ON public.report_share_links FOR SELECT
  TO anon
  USING (is_active = true);

-- 소유자만 리포트 목록 관리
CREATE POLICY "Users manage own share reports"
  ON public.report_share_reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.report_share_links
      WHERE id = share_link_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.report_share_links
      WHERE id = share_link_id AND user_id = auth.uid()
    )
  );

-- 공개 열람용 리포트 목록 조회
CREATE POLICY "Anyone can view shared reports"
  ON public.report_share_reports FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.report_share_links
      WHERE id = share_link_id AND is_active = true
    )
  );

-- premium_report_history도 공유 토큰 경유 시 anon 조회 허용
CREATE POLICY "Anon can view shared reports via token"
  ON public.premium_report_history FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.report_share_reports rsr
      JOIN public.report_share_links rsl ON rsl.id = rsr.share_link_id
      WHERE rsr.report_history_id = premium_report_history.id
        AND rsl.is_active = true
    )
  );

-- 열람 로그: 누구나 INSERT 가능
CREATE POLICY "Anyone can log views"
  ON public.report_share_views FOR INSERT
  TO anon
  WITH CHECK (true);

-- 소유자만 열람 로그 조회
CREATE POLICY "Owners can view share logs"
  ON public.report_share_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.report_share_links
      WHERE id = share_link_id AND user_id = auth.uid()
    )
  );

-- 인덱스
CREATE INDEX idx_share_links_token ON public.report_share_links(share_token);
CREATE INDEX idx_share_links_user ON public.report_share_links(user_id);
CREATE INDEX idx_share_reports_link ON public.report_share_reports(share_link_id);
CREATE INDEX idx_share_views_link ON public.report_share_views(share_link_id);