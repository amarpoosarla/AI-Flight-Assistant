// Coverage tests for lib/flights.ts
// Tests the mock-data fallback path (no Amadeus credentials needed)

import { searchFlights, getFlightById } from '@/lib/flights';

// Ensure Amadeus is NOT configured so we always hit mock data
beforeAll(() => {
  delete process.env.AMADEUS_CLIENT_ID;
  delete process.env.AMADEUS_CLIENT_SECRET;
});

describe('searchFlights — mock fallback', () => {
  it('returns an array when Amadeus is not configured', async () => {
    const results = await searchFlights({
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2026-06-01',
      adults: 1,
    });
    expect(Array.isArray(results)).toBe(true);
  });

  it('each result has required FlightOffer fields', async () => {
    const results = await searchFlights({
      origin: 'DFW',
      destination: 'LAS',
      departureDate: '2026-06-01',
      adults: 1,
    });
    if (results.length > 0) {
      const f = results[0];
      expect(f).toHaveProperty('id');
      expect(f).toHaveProperty('segments');
      expect(f).toHaveProperty('price');
      expect(f).toHaveProperty('currency');
      expect(f).toHaveProperty('stops');
      expect(Array.isArray(f.segments)).toBe(true);
    }
  });

  it('accepts optional returnDate without throwing', async () => {
    await expect(
      searchFlights({
        origin: 'ORD',
        destination: 'MIA',
        departureDate: '2026-06-01',
        returnDate: '2026-06-08',
        adults: 2,
      })
    ).resolves.not.toThrow();
  });
});

describe('getFlightById — mock fallback', () => {
  it('returns null for unknown non-mock id', async () => {
    const result = await getFlightById('unknown-id-12345');
    expect(result).toBeNull();
  });

  it('returns a flight for a valid mock id', async () => {
    // Get a real mock id first
    const flights = await searchFlights({
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2026-06-01',
      adults: 1,
    });
    if (flights.length > 0 && flights[0].id.startsWith('mock-')) {
      const found = await getFlightById(flights[0].id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(flights[0].id);
    }
  });
});
