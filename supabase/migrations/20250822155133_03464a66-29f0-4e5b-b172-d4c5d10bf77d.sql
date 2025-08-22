-- Fix the insecure RLS policy on subscribers table
-- Drop the problematic policy that allows email-based access
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Create a secure SELECT policy that only allows access based on user_id
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Add service role policy for edge functions
CREATE POLICY "Service role can manage all subscriptions" 
ON public.subscribers 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure user_id cannot be null for security
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;