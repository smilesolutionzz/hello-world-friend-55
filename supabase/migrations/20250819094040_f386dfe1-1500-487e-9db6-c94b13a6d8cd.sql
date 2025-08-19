-- Add authentication security improvements

-- Create table for tracking authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT,
  attempt_type TEXT NOT NULL, -- 'login', 'signup', 'password_reset'
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on auth attempts
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for auth attempts (admins only)
CREATE POLICY "Only admins can view auth attempts" 
ON public.auth_attempts 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add session timeout configuration table
CREATE TABLE IF NOT EXISTS public.security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_name TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default security settings
INSERT INTO public.security_settings (setting_name, setting_value) VALUES
('session_timeout_minutes', '480'::jsonb),
('max_login_attempts', '5'::jsonb),
('lockout_duration_minutes', '30'::jsonb),
('password_min_length', '8'::jsonb),
('require_email_confirmation', 'true'::jsonb)
ON CONFLICT (setting_name) DO NOTHING;

-- Enable RLS on security settings
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for security settings (admins only)
CREATE POLICY "Only admins can manage security settings" 
ON public.security_settings 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add function to check failed login attempts
CREATE OR REPLACE FUNCTION public.check_login_attempts(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  max_attempts INTEGER;
  lockout_duration INTEGER;
  failed_attempts INTEGER;
BEGIN
  -- Get max attempts and lockout duration from settings
  SELECT (setting_value::TEXT)::INTEGER INTO max_attempts 
  FROM public.security_settings 
  WHERE setting_name = 'max_login_attempts';
  
  SELECT (setting_value::TEXT)::INTEGER INTO lockout_duration 
  FROM public.security_settings 
  WHERE setting_name = 'lockout_duration_minutes';
  
  -- Count failed attempts in the lockout window
  SELECT COUNT(*) INTO failed_attempts
  FROM public.auth_attempts
  WHERE email = user_email
    AND attempt_type = 'login'
    AND success = false
    AND created_at > (now() - INTERVAL '1 minute' * lockout_duration);
  
  -- Return true if under the limit, false if locked out
  RETURN failed_attempts < COALESCE(max_attempts, 5);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add function to log authentication attempts
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_attempt_type TEXT DEFAULT 'login',
  p_success BOOLEAN DEFAULT false,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.auth_attempts (
    user_id, email, attempt_type, success, ip_address, user_agent
  ) VALUES (
    p_user_id, p_email, p_attempt_type, p_success, p_ip_address, p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;