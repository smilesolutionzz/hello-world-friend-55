-- Fix security vulnerabilities in bank_transfer_requests table
-- Issue: Financial data could be exposed to unauthorized users

-- First, let's tighten the existing policies and add missing ones

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Users can view their own transfer requests" ON public.bank_transfer_requests;
DROP POLICY IF EXISTS "Users can create their own transfer requests" ON public.bank_transfer_requests;
DROP POLICY IF EXISTS "Admins can manage all transfer requests" ON public.bank_transfer_requests;

-- Create stricter policies for bank transfer requests

-- 1. Users can only view their own requests (unchanged but recreated for consistency)
CREATE POLICY "Users can view own transfer requests only"
ON public.bank_transfer_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Users can only create requests for themselves with validation
CREATE POLICY "Users can create own transfer requests only"
ON public.bank_transfer_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND user_email IS NOT NULL 
  AND depositor_name IS NOT NULL
  AND transfer_amount > 0
  AND requested_tokens > 0
);

-- 3. Users can only update non-sensitive fields of their own pending requests
CREATE POLICY "Users can update own pending requests limited fields"
ON public.bank_transfer_requests
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status = 'pending'
)
WITH CHECK (
  auth.uid() = user_id 
  AND status = 'pending'
  -- Prevent users from modifying admin-only fields
  AND processed_by IS NULL
  AND processed_at IS NULL
  AND admin_note IS NULL
);

-- 4. Admins can view all requests but with audit logging
CREATE POLICY "Admins can view all transfer requests"
ON public.bank_transfer_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Admins can update any request (for processing)
CREATE POLICY "Admins can update transfer requests"
ON public.bank_transfer_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. No one can delete transfer requests (for audit trail)
CREATE POLICY "No deletion of transfer requests"
ON public.bank_transfer_requests
FOR DELETE
TO authenticated
USING (false);

-- Create audit log table for financial data access
CREATE TABLE IF NOT EXISTS public.financial_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_table TEXT NOT NULL,
  accessed_record_id UUID NOT NULL,
  accessed_by UUID NOT NULL REFERENCES auth.users(id),
  access_type TEXT NOT NULL, -- 'view', 'update', 'admin_view'
  ip_address TEXT,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sensitive_fields_accessed TEXT[], -- which sensitive fields were accessed
  access_reason TEXT -- why admin accessed the data
);

-- Enable RLS on audit log
ALTER TABLE public.financial_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view financial access logs"
ON public.financial_access_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can create financial access logs"
ON public.financial_access_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create trigger to log access to sensitive financial data
CREATE OR REPLACE FUNCTION public.log_financial_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when admins access user financial data
  IF auth.uid() IS NOT NULL AND TG_OP = 'SELECT' THEN
    -- Check if this is an admin accessing another user's data
    IF EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) AND NEW.user_id != auth.uid() THEN
      INSERT INTO public.financial_access_log (
        accessed_table,
        accessed_record_id,
        accessed_by,
        access_type,
        sensitive_fields_accessed
      ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        auth.uid(),
        'admin_view',
        ARRAY['depositor_name', 'bank_name', 'transfer_amount', 'user_email']
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply trigger to bank_transfer_requests
CREATE TRIGGER log_bank_transfer_access
  AFTER SELECT ON public.bank_transfer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_financial_data_access();

-- Create function for admins to safely access financial data with logging
CREATE OR REPLACE FUNCTION public.admin_view_transfer_request(
  request_id UUID,
  access_reason TEXT DEFAULT 'Administrative review'
)
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  depositor_name TEXT,
  transfer_amount INTEGER,
  requested_tokens INTEGER,
  bank_name TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  admin_note TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can use this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Log the access
  INSERT INTO public.financial_access_log (
    accessed_table,
    accessed_record_id,
    accessed_by,
    access_type,
    access_reason,
    sensitive_fields_accessed
  ) VALUES (
    'bank_transfer_requests',
    request_id,
    auth.uid(),
    'admin_function_access',
    access_reason,
    ARRAY['depositor_name', 'bank_name', 'transfer_amount', 'user_email']
  );

  -- Return the data
  RETURN QUERY
  SELECT 
    btr.id,
    btr.user_email,
    btr.depositor_name,
    btr.transfer_amount,
    btr.requested_tokens,
    btr.bank_name,
    btr.status,
    btr.created_at,
    btr.admin_note
  FROM public.bank_transfer_requests btr
  WHERE btr.id = request_id;
END;
$$;

-- Create function to get masked financial data for reporting (non-sensitive)
CREATE OR REPLACE FUNCTION public.get_transfer_statistics()
RETURNS TABLE (
  total_requests BIGINT,
  pending_requests BIGINT,
  completed_requests BIGINT,
  total_amount_processed BIGINT,
  average_request_amount NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*)::BIGINT as total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::BIGINT as pending_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END)::BIGINT as completed_requests,
    COALESCE(SUM(CASE WHEN status = 'approved' THEN transfer_amount END), 0)::BIGINT as total_amount_processed,
    COALESCE(AVG(transfer_amount), 0)::NUMERIC as average_request_amount
  FROM public.bank_transfer_requests;
$$;