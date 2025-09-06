-- 🔒 CRITICAL SECURITY FIX PHASE 2C: Medical and educational data protection
-- Developmental screening, tracking, and IEP data protection

-- 7. Developmental screening results policies (medical data protection)
DROP POLICY IF EXISTS "Users can view their own screening results" ON public.developmental_screening_results;
DROP POLICY IF EXISTS "Users can insert their own screening results" ON public.developmental_screening_results;
DROP POLICY IF EXISTS "Users can update their own screening results" ON public.developmental_screening_results;

CREATE POLICY "Users can view their own screening results" 
ON public.developmental_screening_results 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own screening results" 
ON public.developmental_screening_results 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own screening results" 
ON public.developmental_screening_results 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all screening results" 
ON public.developmental_screening_results 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- 8. Developmental tracking policies (medical/educational data protection)
DROP POLICY IF EXISTS "Users can manage their own developmental tracking" ON public.developmental_tracking;

CREATE POLICY "Users can manage their own developmental tracking" 
ON public.developmental_tracking 
FOR ALL 
USING (auth.uid() = user_id);

-- 9. Individual education plans policies (sensitive educational data protection)
DROP POLICY IF EXISTS "Users can manage their own IEPs" ON public.individual_education_plans;

CREATE POLICY "Users can manage their own IEPs" 
ON public.individual_education_plans 
FOR ALL 
USING (auth.uid() = user_id);

-- 10. Payment history policies (financial transaction protection)  
CREATE POLICY "Users can view their own payment history" 
ON public.payment_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment records" 
ON public.payment_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment history" 
ON public.payment_history 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));