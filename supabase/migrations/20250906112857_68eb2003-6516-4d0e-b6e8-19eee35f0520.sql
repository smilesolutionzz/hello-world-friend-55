-- 🔒 CRITICAL SECURITY FIX PHASE 2: Create secure RLS policies
-- This creates proper access control for all sensitive data

-- 1. Family members policies (personal info protection)
CREATE POLICY "Users can view their own family members" 
ON public.family_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own family members" 
ON public.family_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members" 
ON public.family_members 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family members" 
ON public.family_members 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all family members" 
ON public.family_members 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Bank transfer requests policies (financial data protection)
CREATE POLICY "Users can view their own transfer requests" 
ON public.bank_transfer_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transfer requests" 
ON public.bank_transfer_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transfer requests" 
ON public.bank_transfer_requests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Assessments policies (medical/psychological data protection)
CREATE POLICY "Users can view their own assessments" 
ON public.assessments 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = assessments.profile_id));

CREATE POLICY "Users can create their own assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = assessments.profile_id));

CREATE POLICY "Users can update their own assessments" 
ON public.assessments 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = assessments.profile_id));

CREATE POLICY "Admins can view all assessments" 
ON public.assessments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));