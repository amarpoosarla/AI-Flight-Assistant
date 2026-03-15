import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { searchFlights } from '@/lib/flights';

const SearchSchema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  adults: z.number().int().min(1).max(9).default(1),
});

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = SearchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const params = parsed.data;

  // Save to search history (fire-and-forget — don't block the response)
  supabase
    .from('search_history')
    .insert({
      user_id: user.id,
      origin: params.origin,
      destination: params.destination,
      departure_date: params.departureDate,
      return_date: params.returnDate ?? null,
      adults: params.adults,
      trip_type: params.returnDate ? 'round-trip' : 'one-way',
    })
    .then(({ error }) => {
      if (error) console.warn('[search_history] insert failed:', error.message);
    });

  try {
    const flights = await searchFlights(params);
    return NextResponse.json({ flights, count: flights.length });
  } catch (err) {
    console.error('[flights/search] error:', err);
    return NextResponse.json({ error: 'Flight search failed. Please try again.' }, { status: 502 });
  }
}
