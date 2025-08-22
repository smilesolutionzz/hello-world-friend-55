-- Fix RLS policies for subscribers table to prevent data exposure
-- First, check and drop existing insecure policies more carefully
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.subscribers;

-- Create secure RLS policies that only allow access to authenticated users for their own data
-- Users can only view their own subscription data based on user_id (NOT email)
CREATE POLICY "users_can_view_own_subscription" 
ON public.subscribers 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own subscription data
CREATE POLICY "users_can_update_own_subscription" 
ON public.subscribers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own subscription data
CREATE POLICY "users_can_insert_own_subscription" 
ON public.subscribers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Service role and admin functions can manage all subscription data
-- This policy is for edge functions using service role key
CREATE POLICY "service_role_can_manage_subscriptions" 
ON public.subscribers 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure user_id is NOT NULL to prevent orphaned records
-- Only proceed if column allows NULL currently
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscribers' 
        AND column_name = 'user_id' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.subscribers 
        ALTER COLUMN user_id SET NOT NULL;
    END IF;
END
$$;