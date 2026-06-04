ALTER TABLE public.center_sessions ADD COLUMN IF NOT EXISTS recurrence_key TEXT;
CREATE INDEX IF NOT EXISTS idx_center_sessions_recurrence ON public.center_sessions(center_id, recurrence_key);