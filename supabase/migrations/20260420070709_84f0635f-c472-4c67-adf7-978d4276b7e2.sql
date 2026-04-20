
CREATE TABLE IF NOT EXISTS public.copilot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT NULL,
  detected_concerns TEXT[] NULL,
  detected_target TEXT NULL,
  detected_severity TEXT NULL,
  recommended_track TEXT NULL,
  recommended_route TEXT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  converted_to_track BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_copilot_conv_user ON public.copilot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_conv_session ON public.copilot_conversations(session_id);

ALTER TABLE public.copilot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own copilot conversations"
ON public.copilot_conversations FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert copilot conversations"
ON public.copilot_conversations FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users update own copilot conversations"
ON public.copilot_conversations FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins delete copilot conversations"
ON public.copilot_conversations FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_copilot_conversations_updated_at
BEFORE UPDATE ON public.copilot_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
