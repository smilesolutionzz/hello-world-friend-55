-- Allow authenticated users to insert their own analytics events
CREATE POLICY "Users can insert their own analytics events"
ON public.user_analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to read their own analytics events
CREATE POLICY "Users can read their own analytics events"
ON public.user_analytics_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);