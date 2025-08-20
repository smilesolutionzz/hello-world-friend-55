-- profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  subscription_tier text not null default 'free',
  created_at timestamptz default now()
);

-- test_types (이미 있으면 스킵)
create table if not exists public.test_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null default 3,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- test_results (이미 있으면 스킵)
create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_type_id uuid not null references public.test_types(id) on delete set null,
  scores jsonb not null,
  raw_data jsonb,
  ai_analysis text,
  expert_feedback text,
  completed_at timestamptz not null default now(),
  created_at timestamptz default now()
);

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
alter table public.profiles enable row level security;
alter table public.test_results enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.payment_history enable row level security;

create policy "Users read/write own profile" on public.profiles
for all using (auth.uid() = user_id);

create policy "Users read their results" on public.test_results
for select using (auth.uid() = user_id);

create policy "Users insert their results" on public.test_results
for insert with check (auth.uid() = user_id);

create policy "Users read subscription" on public.user_subscriptions
for select using (auth.uid() = user_id);

create policy "Users read payments" on public.payment_history
for select using (auth.uid() = user_id);

-- Seed test_types
insert into public.test_types (name, description, duration_minutes)
values
('언어 발달 3분 테스트','어휘/문법/표현/이해 4영역',3),
('회복력(Resilience) 3분 테스트','스트레스/감정조절/적응/지지',3),
('ADHD 자가체크 3분','주의/과잉행동/충동/실행',3)
on conflict do nothing;

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