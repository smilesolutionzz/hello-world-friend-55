-- Fix security vulnerability: Restrict user_tokens UPDATE to owner only
-- This prevents unauthorized users from manipulating others' token balances

DROP POLICY IF EXISTS "user_tokens_update" ON public.user_tokens;

CREATE POLICY "user_tokens_update" 
ON public.user_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add comment for clarity
COMMENT ON POLICY "user_tokens_update" ON public.user_tokens IS 'Users can only update their own token balances. System operations use service role to bypass RLS.';