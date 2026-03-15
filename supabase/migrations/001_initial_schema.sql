-- ============================================================
-- AI Flight Assistant — Initial Schema
-- Run against your Supabase project via the SQL editor or CLI
-- ============================================================

-- Enable UUID extension (usually already enabled on Supabase)
create extension if not exists "uuid-ossp";

-- ---- bookings ------------------------------------------------
-- Stores mock booking confirmations. Each row belongs to one user.
create table if not exists public.bookings (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  flight_id     text not null,
  origin        text not null,
  destination   text not null,
  departure_at  timestamptz not null,
  arrival_at    timestamptz not null,
  airline       text not null,
  flight_number text not null,
  cabin_class   text not null default 'ECONOMY',
  passengers    int not null default 1,
  total_price   numeric(10, 2) not null,
  currency      text not null default 'USD',
  status        text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at    timestamptz not null default now()
);

-- Row Level Security: users only see their own bookings
alter table public.bookings enable row level security;

create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

-- ---- search_history ------------------------------------------
-- Saves recent flight searches per user for UX convenience.
create table if not exists public.search_history (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  origin          text not null,
  destination     text not null,
  departure_date  date not null,
  return_date     date,
  adults          int not null default 1,
  trip_type       text not null default 'one-way' check (trip_type in ('one-way', 'round-trip')),
  created_at      timestamptz not null default now()
);

alter table public.search_history enable row level security;

create policy "Users can view own search history"
  on public.search_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own search history"
  on public.search_history for insert
  with check (auth.uid() = user_id);

-- ---- planner_sessions ----------------------------------------
-- Persists AI planner chat sessions. Messages stored as JSONB array.
create table if not exists public.planner_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,                        -- Auto-generated from first message
  messages    jsonb not null default '[]', -- Array of {role, content, timestamp}
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.planner_sessions enable row level security;

create policy "Users can view own planner sessions"
  on public.planner_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own planner sessions"
  on public.planner_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own planner sessions"
  on public.planner_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own planner sessions"
  on public.planner_sessions for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at on planner_sessions
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_planner_session_updated
  before update on public.planner_sessions
  for each row execute function public.handle_updated_at();

-- ---- Indexes -------------------------------------------------
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists search_history_user_id_idx on public.search_history(user_id);
create index if not exists planner_sessions_user_id_idx on public.planner_sessions(user_id);
