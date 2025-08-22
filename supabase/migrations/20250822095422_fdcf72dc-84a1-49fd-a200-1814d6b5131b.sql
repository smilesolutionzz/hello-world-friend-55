-- Fix critical payment security vulnerability in token_purchases table
-- Drop existing overly permissive policies that allow unrestricted operations
DROP POLICY IF EXISTS "token_purchases_insert" ON public.token_purchases;
DROP POLICY IF EXISTS "token_purchases_update" ON public.token_purchases;

-- Create secure INSERT policy - users can only create purchases for themselves
CREATE POLICY "Users can create their own token purchases" 
ON public.token_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create secure UPDATE policy - only payment system can update records
-- This allows service role (payment confirmation functions) to update but not regular users
CREATE POLICY "Only payment system can update purchases" 
ON public.token_purchases 
FOR UPDATE 
USING (false);

-- Add a separate policy for service role updates (bypasses RLS anyway but documents intent)
-- Service role key in edge functions will bypass all RLS policies automatically