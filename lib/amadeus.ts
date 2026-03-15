import Amadeus from 'amadeus';
import type { FlightOffer, FlightSegment, CabinClass } from '@/types/flight';

// Amadeus SDK client — singleton, server-side only.
// Never import this from client components.
let _client: Amadeus | null = null;

function getClient(): Amadeus {
  if (!_client) {
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      throw new Error('Amadeus credentials not configured');
    }
    _client = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET,
      hostname: (process.env.AMADEUS_HOSTNAME as 'test' | 'production') ?? 'test',
    });
  }
  return _client;
}

// ---- Types from Amadeus response -----------------------------------------

interface AmadeusSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  aircraft?: { code: string };
  duration: string;
  operating?: { carrierCode: string };
}

interface AmadeusItinerary {
  duration: string;
  segments: AmadeusSegment[];
}

interface AmadeusTravelerPricing {
  fareDetailsBySegment: { cabin: string }[];
}

interface AmadeusFlightOffer {
  id: string;
  itineraries: AmadeusItinerary[];
  price: { grandTotal: string; currency: string };
  numberOfBookableSeats?: number;
  travelerPricings: AmadeusTravelerPricing[];
}

// Airline names lookup (common carriers — Amadeus returns codes not names)
const AIRLINE_NAMES: Record<string, string> = {
  AA: 'American Airlines',
  DL: 'Delta Air Lines',
  UA: 'United Airlines',
  WN: 'Southwest Airlines',
  B6: 'JetBlue Airways',
  AS: 'Alaska Airlines',
  NK: 'Spirit Airlines',
  F9: 'Frontier Airlines',
  G4: 'Allegiant Air',
  HA: 'Hawaiian Airlines',
  BA: 'British Airways',
  LH: 'Lufthansa',
  AF: 'Air France',
  KL: 'KLM',
  EK: 'Emirates',
  QR: 'Qatar Airways',
  SQ: 'Singapore Airlines',
  CX: 'Cathay Pacific',
};

function airlineName(code: string): string {
  return AIRLINE_NAMES[code] ?? code;
}

// ---- Transform Amadeus response → our FlightOffer type -------------------

function transformSegment(seg: AmadeusSegment): FlightSegment {
  return {
    departureAirport: seg.departure.iataCode,
    arrivalAirport: seg.arrival.iataCode,
    departureTime: seg.departure.at,
    arrivalTime: seg.arrival.at,
    duration: seg.duration,
    flightNumber: `${seg.carrierCode} ${seg.number}`,
    airline: airlineName(seg.carrierCode),
    airlineCode: seg.carrierCode,
    aircraft: seg.aircraft?.code,
  };
}

function transformOffer(raw: AmadeusFlightOffer, isRoundTrip: boolean): FlightOffer {
  const outbound = raw.itineraries[0];
  const returnLeg = isRoundTrip ? raw.itineraries[1] : undefined;
  const cabin =
    (raw.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin as CabinClass) ?? 'ECONOMY';

  return {
    id: raw.id,
    segments: outbound.segments.map(transformSegment),
    returnSegments: returnLeg?.segments.map(transformSegment),
    totalDuration: outbound.duration,
    stops: outbound.segments.length - 1,
    price: parseFloat(raw.price.grandTotal),
    currency: raw.price.currency,
    cabinClass: cabin,
    seatsAvailable: raw.numberOfBookableSeats,
    source: 'amadeus',
  };
}

// ---- Public API -----------------------------------------------------------

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD, only for round-trip
  adults: number;
  max?: number; // Max results (default 20)
  currencyCode?: string;
}

export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  const client = getClient();
  const isRoundTrip = Boolean(params.returnDate);

  const query: Record<string, string | number> = {
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departureDate,
    adults: params.adults,
    max: params.max ?? 20,
    currencyCode: params.currencyCode ?? 'USD',
  };

  if (params.returnDate) {
    query.returnDate = params.returnDate;
  }

  let response: { data: unknown };
  try {
    response = await client.shopping.flightOffersSearch.get(query);
  } catch (err: unknown) {
    // Amadeus SDK rejects with a plain object, not an Error instance.
    // Convert it so callers can catch a real Error.
    if (err && typeof err === 'object') {
      const amErr = err as { description?: unknown; response?: { statusCode?: number } };
      const status = amErr.response?.statusCode ?? 'unknown';
      const detail = Array.isArray(amErr.description)
        ? (amErr.description as { title?: string; detail?: string }[])
            .map((d) => d.detail ?? d.title ?? '')
            .filter(Boolean)
            .join('; ')
        : String(amErr.description ?? 'Amadeus error');
      throw new Error(`Amadeus ${status}: ${detail}`);
    }
    throw new Error('Amadeus search failed');
  }

  const raw: AmadeusFlightOffer[] = (response.data as AmadeusFlightOffer[]) ?? [];
  return raw.map((offer) => transformOffer(offer, isRoundTrip));
}

export async function getFlightOffer(offerId: string): Promise<FlightOffer | null> {
  // Amadeus doesn't support single offer lookup by ID in the free sandbox.
  // This is a placeholder for when pricing confirmation is needed.
  // In practice, the offer data is passed through session/state from the search results.
  void offerId;
  return null;
}
