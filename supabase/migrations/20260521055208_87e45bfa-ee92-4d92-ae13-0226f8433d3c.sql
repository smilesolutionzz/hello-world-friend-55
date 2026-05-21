
-- 1) Fix mutable search_path on flagged functions
ALTER FUNCTION public.calculate_daily_reward_points(uuid, date) SET search_path = public;
ALTER FUNCTION public.increment_user_tokens(uuid, integer) SET search_path = public;
ALTER FUNCTION public.send_booking_confirmation_notification() SET search_path = public;
ALTER FUNCTION public.update_competitor_monitoring_updated_at() SET search_path = public;
ALTER FUNCTION public.update_curated_content_updated_at() SET search_path = public;
ALTER FUNCTION public.update_user_rewards() SET search_path = public;

-- 2) Convert expert_booking_stats view to SECURITY INVOKER so it respects caller RLS
ALTER VIEW public.expert_booking_stats SET (security_invoker = on);

-- 3) Prevent institution owners from modifying admin-only fields on b2b_partner_institutions
CREATE OR REPLACE FUNCTION public.protect_b2b_partner_institutions_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins are allowed to change anything
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Non-admins (owners) cannot mutate system-managed fields
  IF NEW.churn_risk_score IS DISTINCT FROM OLD.churn_risk_score THEN
    RAISE EXCEPTION 'churn_risk_score is system-managed';
  END IF;
  IF NEW.join_code IS DISTINCT FROM OLD.join_code THEN
    RAISE EXCEPTION 'join_code is system-managed';
  END IF;
  IF NEW.join_code_expires_at IS DISTINCT FROM OLD.join_code_expires_at THEN
    RAISE EXCEPTION 'join_code_expires_at is system-managed';
  END IF;
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    RAISE EXCEPTION 'is_verified is admin-managed';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'ownership transfer is not allowed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_b2b_partner_institutions_admin_fields ON public.b2b_partner_institutions;
CREATE TRIGGER trg_protect_b2b_partner_institutions_admin_fields
  BEFORE UPDATE ON public.b2b_partner_institutions
  FOR EACH ROW EXECUTE FUNCTION public.protect_b2b_partner_institutions_admin_fields();

-- 4) Prevent institution_admin_id reassignment on institution_members
CREATE OR REPLACE FUNCTION public.protect_institution_members_admin_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF NEW.institution_admin_id IS DISTINCT FROM OLD.institution_admin_id THEN
    RAISE EXCEPTION 'institution_admin_id cannot be reassigned';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_institution_members_admin_id ON public.institution_members;
CREATE TRIGGER trg_protect_institution_members_admin_id
  BEFORE UPDATE ON public.institution_members
  FOR EACH ROW EXECUTE FUNCTION public.protect_institution_members_admin_id();
