
-- 사용자 코칭 목표 (30일 트랙)
CREATE TABLE public.user_coaching_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_category TEXT NOT NULL, -- 'depression' | 'anxiety' | 'sleep' | 'adhd' | 'parenting' | 'stress' | 'self_esteem'
  goal_description TEXT,
  target_age_group TEXT, -- 'self' | 'child' | 'senior'
  preferred_send_hour INTEGER NOT NULL DEFAULT 8, -- KST hour (0-23)
  daily_email_opt_in BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Seoul')::date,
  end_date DATE,
  current_day INTEGER NOT NULL DEFAULT 0,
  total_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_coaching_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own coaching goals"
ON public.user_coaching_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own coaching goals"
ON public.user_coaching_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own coaching goals"
ON public.user_coaching_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own coaching goals"
ON public.user_coaching_goals FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_user_coaching_goals_active ON public.user_coaching_goals(user_id, is_active) WHERE is_active = true;

CREATE TRIGGER update_user_coaching_goals_updated_at
BEFORE UPDATE ON public.user_coaching_goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 일일 발송 로그
CREATE TABLE public.daily_coaching_email_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.user_coaching_goals(id) ON DELETE CASCADE,
  send_date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent' | 'failed' | 'skipped'
  subject TEXT,
  mission_content TEXT,
  insight_content TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (goal_id, send_date)
);

ALTER TABLE public.daily_coaching_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own coaching email logs"
ON public.daily_coaching_email_log FOR SELECT
USING (auth.uid() = user_id);

CREATE INDEX idx_daily_coaching_email_log_user_date 
ON public.daily_coaching_email_log(user_id, send_date DESC);
