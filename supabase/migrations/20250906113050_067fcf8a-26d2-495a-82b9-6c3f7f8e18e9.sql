-- 🔒 CRITICAL SECURITY FIX PHASE 2D: Token and order security
-- Protect token orders and payment history

-- Enable RLS on token_orders table if not already enabled
ALTER TABLE public.token_orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payment_history table if not already enabled  
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Token orders policies (financial transaction protection)
DROP POLICY IF EXISTS "Users can view their own token orders" ON public.token_orders;
DROP POLICY IF EXISTS "Users can create their own token orders" ON public.token_orders;
DROP POLICY IF EXISTS "Admins can view all token orders" ON public.token_orders;

CREATE POLICY "Users can view their own token orders" 
ON public.token_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own token orders" 
ON public.token_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own token orders" 
ON public.token_orders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all token orders" 
ON public.token_orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix personalized_missions RLS issues
DROP POLICY IF EXISTS "Users can manage their own missions" ON public.personalized_missions;
DROP POLICY IF EXISTS "Users can view their own missions" ON public.personalized_missions;
DROP POLICY IF EXISTS "Users can create their own missions" ON public.personalized_missions;
DROP POLICY IF EXISTS "Users can update their own missions" ON public.personalized_missions;

CREATE POLICY "Users can manage their own missions" 
ON public.personalized_missions 
FOR ALL 
USING (auth.uid() = user_id);

-- Ensure business analytics are protected  
DROP POLICY IF EXISTS "Admins can view business analytics" ON public.admin_analytics;
DROP POLICY IF EXISTS "Admins can manage business analytics" ON public.admin_analytics;

CREATE POLICY "Admins can view business analytics" 
ON public.admin_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage business analytics" 
ON public.admin_analytics 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));