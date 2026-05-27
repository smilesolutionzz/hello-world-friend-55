
-- B2B 발달센터 무료 트라이얼 (60일)
ALTER TABLE public.center_organizations
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '60 days'),
  ADD COLUMN IF NOT EXISTS trial_status text NOT NULL DEFAULT 'trial';

-- 기존 row backfill
UPDATE public.center_organizations
SET trial_started_at = COALESCE(trial_started_at, created_at),
    trial_ends_at = COALESCE(trial_ends_at, created_at + interval '60 days')
WHERE trial_started_at IS NULL OR trial_ends_at IS NULL;

-- create_center_org 갱신: 트라이얼 자동 부여 (60일)
CREATE OR REPLACE FUNCTION public.create_center_org(_name text)
RETURNS public.center_organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  uid uuid := auth.uid();
  org public.center_organizations;
begin
  if uid is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if _name is null or length(btrim(_name)) = 0 then
    raise exception 'NAME_REQUIRED' using errcode = '22023';
  end if;

  insert into public.center_organizations(name, owner_id, trial_started_at, trial_ends_at, trial_status, plan)
  values (btrim(_name), uid, now(), now() + interval '60 days', 'trial', 'trial')
  returning * into org;

  insert into public.center_members(center_id, user_id, role)
  values (org.id, uid, 'owner')
  on conflict do nothing;

  return org;
end;
$function$;
