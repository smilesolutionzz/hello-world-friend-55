-- Security Enhancement for Bank Transfer Requests Table
-- Add audit logging and strengthen RLS policies

-- Create audit log table for financial data access
CREATE TABLE IF NOT EXISTS public.financial_data_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  accessed_table TEXT NOT NULL,
  accessed_record_id UUID NOT NULL,
  accessed_by UUID NOT NULL,
  access_type TEXT NOT NULL, -- 'view', 'update', 'admin_function_access'
  access_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  sensitive_fields_accessed TEXT[],
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.financial_data_access_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log - only admins can view
CREATE POLICY "Only admins can view financial access logs" ON public.financial_data_access_log
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow system to create logs
CREATE POLICY "System can create financial access logs" ON public.financial_data_access_log
  FOR INSERT WITH CHECK (true);

-- Drop existing RLS policies for bank_transfer_requests to recreate them more securely
DROP POLICY IF EXISTS "Admins can update transfer requests" ON public.bank_transfer_requests;
DROP POLICY IF EXISTS "Admins can view all transfer requests" ON public.bank_transfer_requests;
DROP POLICY IF EXISTS "No deletion of transfer requests" ON public.bank_transfer_requests;
DROP POLICY IF EXISTS "Users can create own transfer requests only" ON public.bank_transfer_requests;
DROP POLICY IF EXISTS "Users can update own pending requests limited fields" ON public.bank_transfer_requests;
DROP POLICY IF EXISTS "Users can view own transfer requests only" ON public.bank_transfer_requests;

-- Create enhanced RLS policies with stricter controls
CREATE POLICY "Users can only view own transfer requests" ON public.bank_transfer_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only create own transfer requests with validation" ON public.bank_transfer_requests
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL AND
    user_email IS NOT NULL AND
    depositor_name IS NOT NULL AND
    transfer_amount > 0 AND
    requested_tokens > 0 AND
    status = 'pending'
  );

CREATE POLICY "Users can only update own pending requests limited fields" ON public.bank_transfer_requests
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    status = 'pending' AND
    processed_by IS NULL AND
    processed_at IS NULL
  ) WITH CHECK (
    auth.uid() = user_id AND
    status = 'pending' AND
    processed_by IS NULL AND
    processed_at IS NULL AND
    admin_note IS NULL
  );

CREATE POLICY "Admins can view transfer requests with audit" ON public.bank_transfer_requests
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update transfer requests with audit" ON public.bank_transfer_requests
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Absolutely no deletion allowed
CREATE POLICY "No deletion of transfer requests allowed" ON public.bank_transfer_requests
  FOR DELETE USING (false);

-- Create secure function for admin access to transfer request data
CREATE OR REPLACE FUNCTION public.admin_view_transfer_request(
  request_id UUID,
  access_reason TEXT DEFAULT 'Administrative review'
) RETURNS TABLE (
  id UUID,
  user_email TEXT,
  depositor_name TEXT,
  transfer_amount INTEGER,
  requested_tokens INTEGER,
  bank_name TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  admin_note TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Only admins can use this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Log the access
  INSERT INTO public.financial_data_access_log (
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

-- Create function to get transfer statistics without exposing sensitive data
CREATE OR REPLACE FUNCTION public.get_transfer_statistics()
RETURNS TABLE (
  total_requests BIGINT,
  pending_requests BIGINT,
  completed_requests BIGINT,
  total_amount_processed BIGINT,
  average_request_amount NUMERIC
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT 
    COUNT(*)::BIGINT as total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::BIGINT as pending_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END)::BIGINT as completed_requests,
    COALESCE(SUM(CASE WHEN status = 'approved' THEN transfer_amount END), 0)::BIGINT as total_amount_processed,
    COALESCE(AVG(transfer_amount), 0)::NUMERIC as average_request_amount
  FROM public.bank_transfer_requests;
$$;

-- Add constraint to ensure user_id is never null
ALTER TABLE public.bank_transfer_requests 
ALTER COLUMN user_id SET NOT NULL;

-- Add constraint to ensure one pending request per user at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_pending_transfer_per_user 
ON public.bank_transfer_requests (user_id) 
WHERE status = 'pending';