
CREATE TABLE IF NOT EXISTS public.center_session_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.center_clients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.center_therapists(id) ON DELETE SET NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_key TEXT NOT NULL,
  image_url TEXT,
  storage_path TEXT,
  ocr_text TEXT,
  ai_extracted JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_uploads_center ON public.center_session_uploads(center_id);
CREATE INDEX IF NOT EXISTS idx_session_uploads_client_week ON public.center_session_uploads(client_id, week_key);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.center_session_uploads TO authenticated;
GRANT ALL ON public.center_session_uploads TO service_role;
ALTER TABLE public.center_session_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_uploads_member_all"
ON public.center_session_uploads FOR ALL TO authenticated
USING (public.is_center_member(center_id))
WITH CHECK (public.is_center_member(center_id));

CREATE TRIGGER trg_session_uploads_updated_at
BEFORE UPDATE ON public.center_session_uploads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.center_parent_reports
  ADD COLUMN IF NOT EXISTS period_type TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS week_key TEXT,
  ADD COLUMN IF NOT EXISTS source_upload_ids UUID[] DEFAULT ARRAY[]::UUID[],
  ADD COLUMN IF NOT EXISTS ai_draft_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS edited_html TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_parent_reports_client_week ON public.center_parent_reports(client_id, week_key);

DROP POLICY IF EXISTS "parent_can_read_own_child_published" ON public.center_parent_reports;
CREATE POLICY "parent_can_read_own_child_published"
ON public.center_parent_reports FOR SELECT TO authenticated
USING (
  status = 'published'
  AND EXISTS (
    SELECT 1 FROM public.center_clients c
    WHERE c.id = client_id AND c.linked_user_id = auth.uid()
  )
);

CREATE TABLE IF NOT EXISTS public.center_parent_report_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.center_parent_reports(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_role TEXT NOT NULL DEFAULT 'parent',
  body TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_report_comments_report ON public.center_parent_report_comments(report_id);

GRANT SELECT, INSERT, DELETE ON public.center_parent_report_comments TO authenticated;
GRANT ALL ON public.center_parent_report_comments TO service_role;
ALTER TABLE public.center_parent_report_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_center_member_all"
ON public.center_parent_report_comments FOR ALL TO authenticated
USING (public.is_center_member(center_id))
WITH CHECK (public.is_center_member(center_id));

CREATE POLICY "comments_parent_read"
ON public.center_parent_report_comments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.center_parent_reports r
    JOIN public.center_clients c ON c.id = r.client_id
    WHERE r.id = report_id AND c.linked_user_id = auth.uid()
  )
);

CREATE POLICY "comments_parent_insert"
ON public.center_parent_report_comments FOR INSERT TO authenticated
WITH CHECK (
  author_user_id = auth.uid()
  AND author_role = 'parent'
  AND EXISTS (
    SELECT 1 FROM public.center_parent_reports r
    JOIN public.center_clients c ON c.id = r.client_id
    WHERE r.id = report_id AND c.linked_user_id = auth.uid()
  )
);

CREATE POLICY "comments_parent_delete_own"
ON public.center_parent_report_comments FOR DELETE TO authenticated
USING (author_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.get_my_linked_children()
RETURNS TABLE (
  client_id UUID,
  center_id UUID,
  center_name TEXT,
  child_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.center_id, o.name, c.name
  FROM public.center_clients c
  JOIN public.center_organizations o ON o.id = c.center_id
  WHERE c.linked_user_id = auth.uid()
  ORDER BY c.name;
$$;

REVOKE ALL ON FUNCTION public.get_my_linked_children() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_linked_children() TO authenticated;
