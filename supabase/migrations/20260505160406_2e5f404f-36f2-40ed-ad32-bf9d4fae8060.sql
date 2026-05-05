ALTER TABLE public.daily_coaching_email_log
  ADD COLUMN IF NOT EXISTS mission_summary text,
  ADD COLUMN IF NOT EXISTS why_today text,
  ADD COLUMN IF NOT EXISTS micro_script jsonb,
  ADD COLUMN IF NOT EXISTS key_actions jsonb,
  ADD COLUMN IF NOT EXISTS expected_outcome text,
  ADD COLUMN IF NOT EXISTS evening_reflection text,
  ADD COLUMN IF NOT EXISTS videos jsonb,
  ADD COLUMN IF NOT EXISTS category_label text,
  ADD COLUMN IF NOT EXISTS research_base text;

CREATE INDEX IF NOT EXISTS idx_daily_coaching_email_log_user_date
  ON public.daily_coaching_email_log (user_id, send_date DESC);