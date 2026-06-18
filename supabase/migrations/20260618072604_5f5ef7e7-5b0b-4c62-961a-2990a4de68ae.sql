
CREATE TABLE public.parent_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid NOT NULL REFERENCES public.center_parent_share_links(id) ON DELETE CASCADE,
  phone text NOT NULL,
  code_hash text NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.parent_otp_codes TO service_role;
ALTER TABLE public.parent_otp_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only" ON public.parent_otp_codes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_parent_otp_codes_link ON public.parent_otp_codes(share_link_id, created_at DESC);

CREATE TABLE public.parent_phone_sessions (
  token text PRIMARY KEY,
  phone text NOT NULL,
  child_id uuid,
  share_link_id uuid REFERENCES public.center_parent_share_links(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.parent_phone_sessions TO service_role;
ALTER TABLE public.parent_phone_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only sessions" ON public.parent_phone_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
