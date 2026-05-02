-- Allow anonymous (logged-out) users to insert analytics events with NULL user_id
-- so we can build true conversion funnels for guest traffic.
-- We keep existing policies (authenticated users + admin) intact.

-- INSERT: anonymous users may insert ONLY rows where user_id IS NULL.
-- This prevents impersonation (a guest cannot insert with another user's id).
CREATE POLICY "Anonymous can insert guest analytics events"
ON public.user_analytics_events
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- SELECT: anonymous users CANNOT read events back. Only admins can aggregate
-- guest analytics through the existing "Only admins can manage analytics" policy.
-- (No new SELECT policy for anon — this is intentional for privacy.)

-- Helpful index for funnel queries (event_name + created_at range scans)
CREATE INDEX IF NOT EXISTS idx_user_analytics_events_event_created
  ON public.user_analytics_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_analytics_events_session
  ON public.user_analytics_events (session_id) WHERE session_id IS NOT NULL;