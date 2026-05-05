
CREATE TABLE IF NOT EXISTS public.daily_coaching_email_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  recipient_email text NOT NULL,
  send_log_message_id text,
  day_number int,
  category text,
  has_section_04 boolean DEFAULT true,
  has_replacement_char boolean DEFAULT false,
  render_issues jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dcet_token ON public.daily_coaching_email_tokens(token);
CREATE INDEX IF NOT EXISTS idx_dcet_recipient ON public.daily_coaching_email_tokens(recipient_email);

ALTER TABLE public.daily_coaching_email_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read tokens" ON public.daily_coaching_email_tokens
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.daily_coaching_email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('open','click','render_check')),
  target_url text,
  user_agent text,
  ip_hash text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dcee_token ON public.daily_coaching_email_events(token);
CREATE INDEX IF NOT EXISTS idx_dcee_type_time ON public.daily_coaching_email_events(event_type, created_at DESC);

ALTER TABLE public.daily_coaching_email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon insert events" ON public.daily_coaching_email_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admins read events" ON public.daily_coaching_email_events
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
