-- Restrict service role access to only specific operations
-- Drop the overly permissive service role policy
DROP POLICY IF EXISTS "service_role_can_manage_subscriptions" ON public.subscribers;

-- Create more restrictive service role policies for edge functions
-- Service role can only INSERT new subscriptions (for signup process)
CREATE POLICY "service_role_can_insert_subscriptions" 
ON public.subscribers 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Service role can only UPDATE existing subscriptions (for payment processing)
CREATE POLICY "service_role_can_update_subscriptions" 
ON public.subscribers 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Service role can SELECT for verification purposes only
CREATE POLICY "service_role_can_select_for_verification" 
ON public.subscribers 
FOR SELECT 
TO service_role
USING (true);

-- NO DELETE policy for service role - once created, subscriptions should be updated, not deleted

-- Add a comment to document the security design
COMMENT ON TABLE public.subscribers IS 'Secure subscribers table: Users can only access their own data via user_id. Service role has limited access for payment processing only. Email-based access removed to prevent data harvesting.';

-- Ensure the table has proper RLS enabled
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;