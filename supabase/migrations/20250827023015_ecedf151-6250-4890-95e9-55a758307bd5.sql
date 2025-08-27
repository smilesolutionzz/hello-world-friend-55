-- Add admin access policies for better data visibility

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all test results  
CREATE POLICY "Admins can view all test results" ON public.test_results
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all payment history
CREATE POLICY "Admins can view all payment history" ON public.payment_history  
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all observation logs
CREATE POLICY "Admins can view all observation logs" ON public.observation_logs
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
FOR SELECT TO authenticated  
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all token orders
CREATE POLICY "Admins can view all token orders" ON public.token_orders
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));