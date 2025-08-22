-- Fix RLS policies for subscribers table to prevent data exposure
-- Drop existing insecure policies
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create secure RLS policies that only allow access to authenticated users for their own data
-- Users can only view their own subscription data based on user_id
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own subscription data
CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own subscription data
CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Service role and admin functions can manage all subscription data
-- This policy is for edge functions using service role key
CREATE POLICY "Service role can manage all subscriptions" 
ON public.subscribers 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Add additional security: make user_id NOT NULL to prevent orphaned records
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;