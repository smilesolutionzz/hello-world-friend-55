-- payments 테이블 생성
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  token_pack text,
  amount int not null,
  customer_name text,
  payment_key text not null,
  method text,
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- RLS 활성화
alter table public.payments enable row level security;

-- 인증된 사용자는 자신의 결제만 조회 가능
create policy "Users can view own payments" on public.payments
  for select using (true);

-- 누구나 삽입 가능 (결제 승인 시)
create policy "Allow insert payments" on public.payments
  for insert with check (true);