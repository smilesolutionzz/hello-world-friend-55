-- B2B funnel events table
CREATE TABLE public.b2b_funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_funnel_events_created_at ON public.b2b_funnel_events(created_at DESC);
CREATE INDEX idx_b2b_funnel_events_event_type ON public.b2b_funnel_events(event_type);
CREATE INDEX idx_b2b_funnel_events_page_path ON public.b2b_funnel_events(page_path);
CREATE INDEX idx_b2b_funnel_events_session_id ON public.b2b_funnel_events(session_id);

ALTER TABLE public.b2b_funnel_events ENABLE ROW LEVEL SECURITY;

-- Anyone (including guests) can insert events for tracking
CREATE POLICY "Anyone can log funnel events"
ON public.b2b_funnel_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read events
CREATE POLICY "Admins can view all funnel events"
ON public.b2b_funnel_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Aggregation function (admin-only via SECURITY DEFINER + role check)
CREATE OR REPLACE FUNCTION public.get_b2b_funnel_summary(
  start_date TIMESTAMPTZ DEFAULT (now() - interval '30 days'),
  end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
  page_path TEXT,
  event_type TEXT,
  event_count BIGINT,
  unique_sessions BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    e.page_path,
    e.event_type,
    COUNT(*)::BIGINT AS event_count,
    COUNT(DISTINCT e.session_id)::BIGINT AS unique_sessions
  FROM public.b2b_funnel_events e
  WHERE e.created_at BETWEEN start_date AND end_date
  GROUP BY e.page_path, e.event_type
  ORDER BY e.page_path, e.event_type;
END;
$$;