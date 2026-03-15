-- ============================================================
-- Dev Seed Data
-- Only run against your LOCAL / DEV Supabase project.
-- Never run against staging or production.
-- ============================================================

-- Note: auth.users rows must be created via the Supabase Auth API or dashboard.
-- Once you have a real user UUID, paste it below:

-- Example: insert a mock booking for testing
-- replace '00000000-0000-0000-0000-000000000001' with a real user id from auth.users

/*
insert into public.bookings (user_id, flight_id, origin, destination, departure_at, arrival_at, airline, flight_number, passengers, total_price)
values (
  '00000000-0000-0000-0000-000000000001',
  'mock-flight-001',
  'JFK', 'LAX',
  '2025-06-15 08:00:00+00',
  '2025-06-15 11:30:00+00',
  'Delta Air Lines',
  'DL 401',
  1,
  349.00
);
*/
