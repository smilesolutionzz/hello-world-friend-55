-- Fix infinite recursion in RLS policies by creating security definer functions

-- 1. Create security definer function to get user's employee profile organization
CREATE OR REPLACE FUNCTION public.get_user_employee_org()
RETURNS UUID AS $$
  SELECT ep.organization_id 
  FROM employee_profiles ep
  JOIN profiles p ON ep.profile_id = p.id
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 2. Create security definer function to check if user is organization admin
CREATE OR REPLACE FUNCTION public.is_organization_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM organizations o
    JOIN profiles p ON o.admin_profile_id = p.id
    WHERE p.user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 3. Create security definer function to get user's metaverse session access
CREATE OR REPLACE FUNCTION public.can_access_metaverse_session(session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM session_participants sp
    JOIN profiles p ON sp.profile_id = p.id
    WHERE sp.session_id = $1 AND p.user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 4. Drop existing problematic policies for employee_profiles
DROP POLICY IF EXISTS "Organization admins can manage employee profiles" ON employee_profiles;
DROP POLICY IF EXISTS "Organization members can view employee profiles" ON employee_profiles;

-- 5. Create new safe RLS policies for employee_profiles
CREATE POLICY "Organization admins can manage employee profiles" 
ON employee_profiles 
FOR ALL 
USING (public.is_organization_admin());

CREATE POLICY "Organization members can view employee profiles" 
ON employee_profiles 
FOR SELECT 
USING (organization_id = public.get_user_employee_org());

-- 6. Drop existing problematic policies for metaverse_sessions if they exist
DROP POLICY IF EXISTS "Users can access their metaverse sessions" ON metaverse_sessions;

-- 7. Create new safe RLS policy for metaverse_sessions
CREATE POLICY "Users can access their metaverse sessions" 
ON metaverse_sessions 
FOR ALL 
USING (public.can_access_metaverse_session(id));

-- 8. Drop existing problematic policies for session_participants if they exist
DROP POLICY IF EXISTS "Users can manage their session participation" ON session_participants;

-- 9. Create new safe RLS policy for session_participants
CREATE POLICY "Users can manage their session participation" 
ON session_participants 
FOR ALL 
USING (profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- 10. Secure experts table - require authentication for viewing
DROP POLICY IF EXISTS "Anyone can view visible experts" ON experts;

CREATE POLICY "Authenticated users can view visible experts" 
ON experts 
FOR SELECT 
TO authenticated
USING (visible = true);

-- 11. Add search_path security to vulnerable functions
CREATE OR REPLACE FUNCTION public.update_timeline_activities_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.grant_welcome_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_tokens (user_id, current_tokens)
  VALUES (NEW.id, 5)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.consume_tokens(p_user_id uuid, p_feature_type text, p_tokens_needed integer, p_feature_id uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_balance INTEGER;
  result JSONB;
BEGIN
  SELECT current_tokens INTO current_balance
  FROM public.user_tokens
  WHERE user_id = p_user_id;
  
  IF current_balance IS NULL OR current_balance < p_tokens_needed THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', '토큰이 부족합니다',
      'current_tokens', COALESCE(current_balance, 0),
      'needed_tokens', p_tokens_needed
    );
  END IF;
  
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens - p_tokens_needed,
    total_used = total_used + p_tokens_needed,
    last_used_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  INSERT INTO public.token_usage_history (
    user_id, feature_type, tokens_used, feature_id
  ) VALUES (
    p_user_id, p_feature_type, p_tokens_needed, p_feature_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', '토큰이 차감되었습니다',
    'remaining_tokens', current_balance - p_tokens_needed,
    'used_tokens', p_tokens_needed
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_family_ids(user_uuid uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT ARRAY_AGG(DISTINCT fm.family_id)
  FROM family_members fm
  JOIN profiles p ON fm.profile_id = p.id
  WHERE p.user_id = user_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.is_family_creator(family_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM families f
    JOIN profiles p ON f.created_by = p.id
    WHERE f.id = family_uuid AND p.user_id = user_uuid
  );
$function$;

CREATE OR REPLACE FUNCTION public.process_referral_reward(p_referral_code text, p_referred_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  referral_record RECORD;
  referred_profile_id UUID;
  result JSONB;
BEGIN
  SELECT id INTO referred_profile_id
  FROM public.profiles
  WHERE user_id = p_referred_user_id;
  
  IF referred_profile_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', '프로필을 찾을 수 없습니다'
    );
  END IF;
  
  SELECT * INTO referral_record
  FROM public.user_referrals
  WHERE referral_code = p_referral_code
    AND status = 'pending'
    AND reward_given = false;
    
  IF referral_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', '유효하지 않은 추천 코드입니다'
    );
  END IF;
  
  UPDATE public.user_referrals
  SET 
    referred_profile_id = referred_profile_id,
    status = 'completed',
    completed_at = now(),
    reward_given = true
  WHERE id = referral_record.id;
  
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased)
  SELECT 
    p.user_id,
    referral_record.reward_tokens,
    0
  FROM public.profiles p
  WHERE p.id = referral_record.referrer_profile_id
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    current_tokens = user_tokens.current_tokens + referral_record.reward_tokens,
    updated_at = now();
  
  INSERT INTO public.token_usage_history (
    user_id, feature_type, tokens_used, feature_id
  )
  SELECT 
    p.user_id,
    'referral_reward',
    -referral_record.reward_tokens,
    referral_record.id
  FROM public.profiles p
  WHERE p.id = referral_record.referrer_profile_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', '추천 보상이 지급되었습니다',
    'reward_tokens', referral_record.reward_tokens
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_referral_code(p_referrer_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  referrer_profile_id UUID;
  referral_code TEXT;
BEGIN
  SELECT id INTO referrer_profile_id
  FROM public.profiles
  WHERE user_id = p_referrer_user_id;
  
  IF referrer_profile_id IS NULL THEN
    RAISE EXCEPTION '프로필을 찾을 수 없습니다';
  END IF;
  
  referral_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  
  INSERT INTO public.user_referrals (
    referrer_profile_id,
    referred_profile_id,
    referral_code,
    status
  ) VALUES (
    referrer_profile_id,
    referrer_profile_id,
    referral_code,
    'pending'
  );
  
  RETURN referral_code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, phone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_usage_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO user_subscription_usage (user_id, usage_count)
  VALUES (NEW.profile_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    usage_count = user_subscription_usage.usage_count + 1,
    updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'expert' THEN 2
      WHEN 'viewer' THEN 3
    END
  LIMIT 1
$function$;

-- 12. Add audit logging for role changes
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role app_role,
  new_role app_role NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

-- 13. Enable RLS on role change audit
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- 14. Create policy for role change audit (only admins can view)
CREATE POLICY "Only admins can view role changes" 
ON public.role_change_audit 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 15. Add trigger to log role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.role_change_audit (user_id, old_role, new_role, changed_by)
    VALUES (NEW.user_id, OLD.role, NEW.role, auth.uid());
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_change_audit (user_id, old_role, new_role, changed_by)
    VALUES (NEW.user_id, NULL, NEW.role, auth.uid());
  END IF;
  RETURN NEW;
END;
$function$;

-- 16. Create trigger for role changes
DROP TRIGGER IF EXISTS log_user_role_changes ON public.user_roles;
CREATE TRIGGER log_user_role_changes
  AFTER INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_changes();