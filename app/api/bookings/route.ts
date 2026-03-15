import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const BookingSchema = z.object({
  flightId: z.string().min(1),
  origin: z.string().length(3),
  destination: z.string().length(3),
  departureAt: z.string(),
  arrivalAt: z.string(),
  airline: z.string().min(1),
  flightNumber: z.string().min(1),
  cabinClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  passengers: z.number().int().min(1).max(9).default(1),
  totalPrice: z.number().positive(),
  currency: z.string().length(3).default('USD'),
});

// POST /api/bookings — create a mock booking confirmation
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid booking data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      flight_id: data.flightId,
      origin: data.origin.toUpperCase(),
      destination: data.destination.toUpperCase(),
      departure_at: data.departureAt,
      arrival_at: data.arrivalAt,
      airline: data.airline,
      flight_number: data.flightNumber,
      cabin_class: data.cabinClass,
      passengers: data.passengers,
      total_price: data.totalPrice,
      currency: data.currency,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) {
    console.error('[bookings] insert error:', error.message);
    return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
  }

  return NextResponse.json({ booking }, { status: 201 });
}

// GET /api/bookings — list user's bookings
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }

  return NextResponse.json({ bookings });
}
