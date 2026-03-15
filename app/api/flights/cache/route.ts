import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const CacheSchema = z.object({
  offer: z.object({ id: z.string() }).passthrough(), // full FlightOffer
});

// POST /api/flights/cache — store a flight offer so it survives refresh/direct link
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CacheSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid offer data' }, { status: 400 });
  }

  const { offer } = parsed.data;

  // Upsert — if the same flight ID is cached again, refresh the TTL
  const { error } = await supabase.from('flight_offer_cache').upsert(
    {
      id: offer.id,
      user_id: user.id,
      offer_data: offer,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('[flight cache] upsert error:', error.message);
    return NextResponse.json({ error: 'Cache write failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
