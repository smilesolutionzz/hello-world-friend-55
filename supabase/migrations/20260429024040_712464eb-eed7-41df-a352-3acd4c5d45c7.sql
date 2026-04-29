ALTER TABLE public.mind_track_daily_missions
  ADD COLUMN IF NOT EXISTS why_it_matters text,
  ADD COLUMN IF NOT EXISTS action_steps jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS success_criteria text,
  ADD COLUMN IF NOT EXISTS deeper_prompts jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'medium';