// Data access layer for flights.
// API routes and server components call this — never Amadeus directly.
// Automatically falls back to mock data if Amadeus credentials are absent.

import type { FlightOffer } from '@/types/flight';
import { getMockFlights } from './mock-data';
import { logger } from './logger';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  max?: number;
}

function amadeusConfigured(): boolean {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  if (!amadeusConfigured()) {
    logger.warn('[flights] Amadeus not configured — using mock data');
    return getMockFlights(params.origin, params.destination);
  }

  // Dynamic import so the Amadeus SDK is never bundled client-side
  const { searchFlights: amadeusSearch } = await import('./amadeus');
  try {
    return await amadeusSearch({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults,
      max: params.max ?? 20,
    });
  } catch (err) {
    logger.warn(
      '[flights] Amadeus error — falling back to mock:',
      err instanceof Error ? err.message : err
    );
    return getMockFlights(params.origin, params.destination);
  }
}

export async function getFlightById(id: string): Promise<FlightOffer | null> {
  // For mock IDs, look up from mock data
  if (id.startsWith('mock-')) {
    const { MOCK_FLIGHTS } = await import('./mock-data');
    return MOCK_FLIGHTS.find((f) => f.id === id) ?? null;
  }

  if (!amadeusConfigured()) return null;

  const { getFlightOffer } = await import('./amadeus');
  return getFlightOffer(id);
}
