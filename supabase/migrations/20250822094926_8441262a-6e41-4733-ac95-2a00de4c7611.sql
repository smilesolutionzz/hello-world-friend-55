-- Fix security vulnerability in subscribers table RLS policies
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create secure policies that only allow users to manage their own records
CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Note: Edge functions using service role key will bypass RLS policies,
-- so the check-subscription function will continue to work for automated updates