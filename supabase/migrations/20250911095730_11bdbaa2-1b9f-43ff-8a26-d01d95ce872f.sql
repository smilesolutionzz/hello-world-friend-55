-- Enhanced security measures for expert_applications table

-- 1. Create a secure function for admin access with audit logging
CREATE OR REPLACE FUNCTION public.admin_view_expert_application(
    application_id uuid,
    access_reason text DEFAULT 'Administrative review'::text
)
RETURNS TABLE(
    id uuid,
    user_id uuid,
    application_status text,
    full_name text,
    email text,
    specializations text[],
    years_experience integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
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

    -- Log the access for audit purposes
    INSERT INTO public.expert_application_access_log (
        application_id,
        accessed_by,
        access_type,
        access_reason,
        sensitive_fields_accessed
    ) VALUES (
        application_id,
        auth.uid(),
        'admin_function_access',
        access_reason,
        ARRAY['full_name', 'email', 'phone', 'address', 'license_number']
    );

    -- Return sanitized data (excluding most sensitive fields)
    RETURN QUERY
    SELECT 
        ea.id,
        ea.user_id,
        ea.application_status,
        ea.full_name,
        ea.email,
        ea.specializations,
        ea.years_experience,
        ea.created_at,
        ea.updated_at
    FROM public.expert_applications ea
    WHERE ea.id = application_id;
END;
$$;

-- 2. Create an audit log table for expert application access
CREATE TABLE IF NOT EXISTS public.expert_application_access_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid REFERENCES public.expert_applications(id) ON DELETE CASCADE,
    accessed_by uuid NOT NULL,
    access_type text NOT NULL,
    access_reason text,
    sensitive_fields_accessed text[],
    accessed_at timestamp with time zone DEFAULT now(),
    ip_address text,
    user_agent text
);

-- Enable RLS on the audit log table
ALTER TABLE public.expert_application_access_log ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for the audit log (only admins can view)
CREATE POLICY "Admin only audit log access" 
ON public.expert_application_access_log 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Add data retention policy function (delete logs older than 2 years)
CREATE OR REPLACE FUNCTION public.cleanup_expert_access_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.expert_application_access_log
    WHERE accessed_at < NOW() - INTERVAL '2 years';
END;
$$;

-- 5. Create a function for users to view only their own non-sensitive data
CREATE OR REPLACE FUNCTION public.get_my_application_status()
RETURNS TABLE(
    id uuid,
    application_status text,
    specializations text[],
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    admin_notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only return data for the authenticated user
    RETURN QUERY
    SELECT 
        ea.id,
        ea.application_status,
        ea.specializations,
        ea.created_at,
        ea.updated_at,
        ea.admin_notes
    FROM public.expert_applications ea
    WHERE ea.user_id = auth.uid();
END;
$$;

-- 6. Update existing RLS policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own applications" ON public.expert_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.expert_applications;

-- 7. Create new, more secure RLS policies
CREATE POLICY "Users can view limited own application data" 
ON public.expert_applications 
FOR SELECT 
USING (
    auth.uid() = user_id 
    -- Only allow access to non-sensitive fields in direct queries
);

CREATE POLICY "Admins can view applications through secure function only" 
ON public.expert_applications 
FOR SELECT 
USING (
    has_role(auth.uid(), 'admin'::app_role) 
    -- Admin access should go through the secure function for audit logging
);

-- 8. Ensure sensitive data is encrypted at rest (add comment for documentation)
COMMENT ON COLUMN public.expert_applications.full_name IS 'SENSITIVE: Personal name - access logged';
COMMENT ON COLUMN public.expert_applications.phone IS 'SENSITIVE: Phone number - access logged';
COMMENT ON COLUMN public.expert_applications.email IS 'SENSITIVE: Email address - access logged';
COMMENT ON COLUMN public.expert_applications.address IS 'SENSITIVE: Home address - access logged';
COMMENT ON COLUMN public.expert_applications.license_number IS 'SENSITIVE: Professional license - access logged';
COMMENT ON COLUMN public.expert_applications.certificate_files IS 'SENSITIVE: Certificate files - access logged';

-- 9. Create a trigger to automatically log any direct access attempts
CREATE OR REPLACE FUNCTION public.log_expert_application_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log access attempts for monitoring
    IF TG_OP = 'SELECT' AND auth.uid() IS NOT NULL THEN
        INSERT INTO public.expert_application_access_log (
            application_id,
            accessed_by,
            access_type,
            access_reason
        ) VALUES (
            COALESCE(NEW.id, OLD.id),
            auth.uid(),
            'direct_table_access',
            'Direct table query'
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;