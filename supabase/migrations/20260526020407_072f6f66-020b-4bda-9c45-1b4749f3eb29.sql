
create or replace function public.create_center_org(_name text)
returns public.center_organizations
language plpgsql
security definer
set search_path = public
as $$
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

  insert into public.center_organizations(name, owner_id)
  values (btrim(_name), uid)
  returning * into org;

  insert into public.center_members(center_id, user_id, role)
  values (org.id, uid, 'owner')
  on conflict do nothing;

  return org;
end;
$$;

revoke all on function public.create_center_org(text) from public;
grant execute on function public.create_center_org(text) to authenticated;
