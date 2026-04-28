
create table if not exists public.voice_counseling_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz not null default now(),
  duration_seconds integer not null default 0,
  message_count integer not null default 0,
  title text,
  summary text,
  transcript jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_voice_counseling_sessions_user_created
  on public.voice_counseling_sessions(user_id, created_at desc);

alter table public.voice_counseling_sessions enable row level security;

create policy "users select own voice sessions"
  on public.voice_counseling_sessions for select
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'::app_role));

create policy "users insert own voice sessions"
  on public.voice_counseling_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users delete own voice sessions"
  on public.voice_counseling_sessions for delete
  to authenticated
  using (auth.uid() = user_id);
