-- ============================================================
-- Flight Offer Cache
-- Stores the full serialized FlightOffer JSON for a short TTL.
-- Written when user selects a flight, read on direct URL access.
-- Fixes direct-open and refresh on /flights/[id] pages.
-- ============================================================

create table if not exists public.flight_offer_cache (
  id          text primary key,        -- the FlightOffer.id value
  user_id     uuid not null references auth.users(id) on delete cascade,
  offer_data  jsonb not null,           -- full FlightOffer serialized
  expires_at  timestamptz not null default (now() + interval '24 hours')
);

alter table public.flight_offer_cache enable row level security;

create policy "Users can read own cached offers"
  on public.flight_offer_cache for select
  using (auth.uid() = user_id);

create policy "Users can insert own cached offers"
  on public.flight_offer_cache for insert
  with check (auth.uid() = user_id);

-- Upsert policy (update existing entry for the same flight id)
create policy "Users can update own cached offers"
  on public.flight_offer_cache for update
  using (auth.uid() = user_id);

create index if not exists flight_offer_cache_user_id_idx
  on public.flight_offer_cache(user_id);

create index if not exists flight_offer_cache_expires_at_idx
  on public.flight_offer_cache(expires_at);
