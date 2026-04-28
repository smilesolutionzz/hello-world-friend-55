
-- email_send_log
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text,
  template_name text NOT NULL,
  recipient_email text NOT NULL,
  status text NOT NULL,
  error_message text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_send_log_created_at ON public.email_send_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_send_log_message_id ON public.email_send_log(message_id);
CREATE INDEX IF NOT EXISTS idx_email_send_log_template ON public.email_send_log(template_name);
CREATE INDEX IF NOT EXISTS idx_email_send_log_status ON public.email_send_log(status);
ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view email send log" ON public.email_send_log;
CREATE POLICY "Admins can view email send log" ON public.email_send_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- suppressed_emails
CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  email text PRIMARY KEY,
  reason text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Admins can view suppressed emails" ON public.suppressed_emails FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- email_unsubscribe_tokens
CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  token text PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_email_unsub_tokens_email ON public.email_unsubscribe_tokens(email);
ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view unsubscribe tokens" ON public.email_unsubscribe_tokens;
CREATE POLICY "Admins can view unsubscribe tokens" ON public.email_unsubscribe_tokens FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- email_send_state (single-row config)
CREATE TABLE IF NOT EXISTS public.email_send_state (
  id integer PRIMARY KEY DEFAULT 1,
  batch_size integer NOT NULL DEFAULT 10,
  send_delay_ms integer NOT NULL DEFAULT 200,
  auth_email_ttl_minutes integer NOT NULL DEFAULT 15,
  transactional_email_ttl_minutes integer NOT NULL DEFAULT 60,
  rate_limit_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_send_state_singleton CHECK (id = 1)
);
INSERT INTO public.email_send_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view email send state" ON public.email_send_state;
CREATE POLICY "Admins can view email send state" ON public.email_send_state FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
