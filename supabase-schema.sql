create table if not exists public.wallet_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  wallet numeric(12, 2) not null default 1000.00,
  savings numeric(12, 2) not null default 0.00,
  time_deposit numeric(12, 2) not null default 0.00,
  goal_balance numeric(12, 2) not null default 0.00,
  app_state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wallet_states enable row level security;

drop policy if exists "Users can read their wallet state" on public.wallet_states;
create policy "Users can read their wallet state"
  on public.wallet_states
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their wallet state" on public.wallet_states;
create policy "Users can create their wallet state"
  on public.wallet_states
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their wallet state" on public.wallet_states;
create policy "Users can update their wallet state"
  on public.wallet_states
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
