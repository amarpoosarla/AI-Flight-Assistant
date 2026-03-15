// ============================================================
// Flight Domain Types
// ============================================================

export type TripType = 'one-way' | 'round-trip';
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type BookingStatus = 'confirmed' | 'cancelled';

export interface SearchParams {
  origin: string;           // IATA code, e.g. "JFK"
  destination: string;      // IATA code, e.g. "LAX"
  departureDate: string;    // ISO date string "YYYY-MM-DD"
  returnDate?: string;      // ISO date string, only for round-trip
  adults: number;
  tripType: TripType;
  cabinClass?: CabinClass;
}

export interface FlightSegment {
  departureAirport: string;     // IATA code
  arrivalAirport: string;       // IATA code
  departureTime: string;        // ISO datetime
  arrivalTime: string;          // ISO datetime
  duration: string;             // e.g. "PT5H30M"
  flightNumber: string;         // e.g. "DL 401"
  airline: string;
  airlineCode: string;          // IATA carrier code
  aircraft?: string;
}

export interface FlightOffer {
  id: string;
  segments: FlightSegment[];    // Outbound leg(s)
  returnSegments?: FlightSegment[];  // Return leg(s) for round-trip
  totalDuration: string;        // e.g. "PT5H30M"
  stops: number;
  price: number;
  currency: string;
  cabinClass: CabinClass;
  seatsAvailable?: number;
  source: 'amadeus' | 'mock';
}

export interface Booking {
  id: string;
  userId: string;
  flightId: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  airline: string;
  flightNumber: string;
  cabinClass: CabinClass;
  passengers: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Airport {
  iataCode: string;
  name: string;
  city: string;
  country: string;
}
