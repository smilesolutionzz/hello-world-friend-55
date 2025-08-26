-- Fix payment_history RLS policies for financial data security
-- Drop the insecure policies that allow anyone to insert/update payment records
DROP POLICY IF EXISTS "결제 내역 생성" ON public.payment_history;
DROP POLICY IF EXISTS "결제 내역 업데이트" ON public.payment_history;

-- Create secure INSERT policy - only allow users to create their own payment records
CREATE POLICY "Users can create their own payment records"
ON public.payment_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create secure UPDATE policy - only allow users to update their own payment records
-- Also allow system updates (when auth.uid() is null for edge functions)
CREATE POLICY "Users can update their own payment records"
ON public.payment_history
FOR UPDATE
USING (
  auth.uid() = user_id OR 
  auth.uid() IS NULL  -- Allow edge functions to update payment status
)
WITH CHECK (
  auth.uid() = user_id OR 
  auth.uid() IS NULL  -- Allow edge functions to update payment status
);