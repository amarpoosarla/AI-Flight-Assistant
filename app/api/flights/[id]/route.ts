import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFlightById } from '@/lib/flights';
import type { FlightOffer } from '@/types/flight';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  // 1. Try mock data first (fast, no DB)
  const mockFlight = await getFlightById(id);
  if (mockFlight) return NextResponse.json({ flight: mockFlight });

  // 2. Look up the server-side cache for Amadeus/live offers
  const { data: cached } = await supabase
    .from('flight_offer_cache')
    .select('offer_data, expires_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (cached) {
    // Evict expired entries
    if (new Date(cached.expires_at) < new Date()) {
      await supabase.from('flight_offer_cache').delete().eq('id', id);
      return NextResponse.json(
        { error: 'Flight offer has expired. Please search again.' },
        { status: 410 }
      );
    }
    return NextResponse.json({ flight: cached.offer_data as FlightOffer });
  }

  return NextResponse.json(
    { error: 'Flight not found. It may have expired — please search again.' },
    { status: 404 }
  );
}
