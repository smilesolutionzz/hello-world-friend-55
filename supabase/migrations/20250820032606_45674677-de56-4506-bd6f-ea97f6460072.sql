-- profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  subscription_tier text not null default 'free',
  created_at timestamptz default now()
);

-- Add subscription_tier column to existing profiles table if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'subscription_tier') then
    alter table public.profiles add column subscription_tier text not null default 'free';
  end if;
end $$;

-- subscriptions
create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null, -- 'free' | 'premium'
  period text not null, -- 'monthly' | 'yearly'
  status text not null default 'active', -- active | canceled | past_due
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- payments
create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, -- 'stripe' | 'toss'
  order_id text not null unique,
  amount int not null,
  currency text not null default 'KRW',
  status text not null default 'pending', -- pending | paid | failed | refunded
  metadata jsonb,
  created_at timestamptz default now()
);

-- RLS
alter table public.user_subscriptions enable row level security;
alter table public.payment_history enable row level security;

-- Update existing RLS for profiles to include insert
drop policy if exists "Users read/write own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles
for all using (auth.uid() = user_id);

create policy "Users read subscription" on public.user_subscriptions
for select using (auth.uid() = user_id);

create policy "Users read payments" on public.payment_history
for select using (auth.uid() = user_id);

-- Profile upsert trigger (가입 시 자동 생성)
create or replace function public.ensure_profile()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.ensure_profile();