
CREATE TABLE public.card_news_shorts_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  draft_id UUID REFERENCES public.card_news_drafts(id) ON DELETE SET NULL,
  source_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  style_key TEXT,
  note TEXT,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_news_shorts_requests TO authenticated;
GRANT ALL ON public.card_news_shorts_requests TO service_role;
ALTER TABLE public.card_news_shorts_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own shorts requests" ON public.card_news_shorts_requests
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Service role full access" ON public.card_news_shorts_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);
