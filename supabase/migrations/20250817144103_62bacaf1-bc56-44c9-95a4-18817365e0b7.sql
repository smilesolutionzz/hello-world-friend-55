-- Fix payment_history RLS policies for edge functions
-- First, check if payment_history table exists and fix its policies

-- Create payment_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  toss_payment_key text,
  toss_order_id text UNIQUE,
  amount integer NOT NULL,
  currency text DEFAULT 'KRW',
  payment_method text,
  status text DEFAULT 'pending',
  plan_id uuid,
  subscription_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Users can insert their own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Service role can manage all payment history" ON public.payment_history;

-- Create policies for users to view their own payment history
CREATE POLICY "Users can view their own payment history" 
ON public.payment_history 
FOR SELECT 
USING (user_id = auth.uid());

-- Create policy for edge functions to insert payment history (using service role)
CREATE POLICY "Service role can manage all payment history" 
ON public.payment_history 
FOR ALL 
USING (true);

-- Also check user_subscription_usage table policies
DROP POLICY IF EXISTS "Service role can manage subscription usage" ON public.user_subscription_usage;

CREATE POLICY "Service role can manage subscription usage" 
ON public.user_subscription_usage 
FOR ALL 
USING (true);