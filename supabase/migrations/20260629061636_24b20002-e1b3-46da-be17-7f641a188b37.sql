
CREATE TABLE public.card_news_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL REFERENCES public.center_organizations(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  title text,
  source_type text,
  source_report_id uuid,
  anonymized_text text,
  result_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  style_key text DEFAULT 'gold-dark',
  branding jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_news_drafts TO authenticated;
GRANT ALL ON public.card_news_drafts TO service_role;

ALTER TABLE public.card_news_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "card_news_drafts read by center members"
ON public.card_news_drafts FOR SELECT TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.center_members m
    WHERE m.center_id = card_news_drafts.center_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "card_news_drafts insert by owner"
ON public.card_news_drafts FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "card_news_drafts update by owner"
ON public.card_news_drafts FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "card_news_drafts delete by owner"
ON public.card_news_drafts FOR DELETE TO authenticated
USING (owner_id = auth.uid());

CREATE INDEX card_news_drafts_center_idx ON public.card_news_drafts(center_id, created_at DESC);

CREATE TRIGGER trg_card_news_drafts_updated_at
BEFORE UPDATE ON public.card_news_drafts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
