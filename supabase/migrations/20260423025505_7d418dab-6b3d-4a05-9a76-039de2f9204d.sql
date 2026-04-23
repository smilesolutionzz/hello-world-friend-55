
CREATE TABLE IF NOT EXISTS public.daily_coaching_video_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id text NOT NULL,
  category text,
  sent_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dcvh_user_date ON public.daily_coaching_video_history(user_id, sent_date DESC);
CREATE INDEX IF NOT EXISTS idx_dcvh_user_video ON public.daily_coaching_video_history(user_id, video_id);

ALTER TABLE public.daily_coaching_video_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own video history"
  ON public.daily_coaching_video_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages video history"
  ON public.daily_coaching_video_history FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.user_video_preferences (
  user_id uuid PRIMARY KEY,
  interest_topics text[] NOT NULL DEFAULT ARRAY[]::text[],
  difficulty_level text NOT NULL DEFAULT 'beginner',
  preferred_duration text NOT NULL DEFAULT 'short',
  language text NOT NULL DEFAULT 'ko',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_video_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own video preferences"
  ON public.user_video_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role reads all video preferences"
  ON public.user_video_preferences FOR SELECT
  USING (auth.role() = 'service_role');

CREATE TRIGGER trg_uvp_updated_at
  BEFORE UPDATE ON public.user_video_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
