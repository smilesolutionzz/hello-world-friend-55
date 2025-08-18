-- Fix the security issue in payment_history table
-- Remove the overly permissive policy and create secure ones

-- Drop the insecure policy that allows all access
DROP POLICY IF EXISTS "Service role can manage all payment history" ON public.payment_history;

-- Create a secure policy for service role access (only for backend operations)
-- This should only be accessible via service role key, not public access
CREATE POLICY "Service role access only" ON public.payment_history
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure users can only view their own payment history
DROP POLICY IF EXISTS "Users can view their own payment history" ON public.payment_history;
CREATE POLICY "Users can view their own payment history" ON public.payment_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ensure users can only insert payments for themselves
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payment_history;
CREATE POLICY "Users can insert their own payments" ON public.payment_history
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users should be able to update their own payment records (for status updates)
CREATE POLICY "Users can update their own payments" ON public.payment_history
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Prevent users from deleting payment history (audit trail)
-- Only service role should be able to delete if needed
CREATE POLICY "Prevent user deletions" ON public.payment_history
FOR DELETE
TO authenticated
USING (false);