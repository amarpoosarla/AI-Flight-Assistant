import type { FlightOffer } from '@/types/flight';

// Used when Amadeus credentials are missing (local dev without .env.local)
// or as a fallback in tests. Covers realistic data for DFW↔LAS and ORD↔LAS
// to match the AI planner demo scenario in the brief.

export const MOCK_FLIGHTS: FlightOffer[] = [
  {
    id: 'mock-001',
    segments: [
      {
        departureAirport: 'DFW',
        arrivalAirport: 'LAS',
        departureTime: '2025-06-15T07:00:00',
        arrivalTime: '2025-06-15T08:10:00',
        duration: 'PT2H10M',
        flightNumber: 'AA 1234',
        airline: 'American Airlines',
        airlineCode: 'AA',
        aircraft: '737',
      },
    ],
    totalDuration: 'PT2H10M',
    stops: 0,
    price: 189,
    currency: 'USD',
    cabinClass: 'ECONOMY',
    seatsAvailable: 4,
    source: 'mock',
  },
  {
    id: 'mock-002',
    segments: [
      {
        departureAirport: 'DFW',
        arrivalAirport: 'LAS',
        departureTime: '2025-06-15T12:30:00',
        arrivalTime: '2025-06-15T13:45:00',
        duration: 'PT2H15M',
        flightNumber: 'WN 456',
        airline: 'Southwest Airlines',
        airlineCode: 'WN',
        aircraft: '737',
      },
    ],
    totalDuration: 'PT2H15M',
    stops: 0,
    price: 149,
    currency: 'USD',
    cabinClass: 'ECONOMY',
    seatsAvailable: 8,
    source: 'mock',
  },
  {
    id: 'mock-003',
    segments: [
      {
        departureAirport: 'ORD',
        arrivalAirport: 'LAS',
        departureTime: '2025-06-15T06:00:00',
        arrivalTime: '2025-06-15T08:30:00',
        duration: 'PT3H30M',
        flightNumber: 'UA 789',
        airline: 'United Airlines',
        airlineCode: 'UA',
        aircraft: '737',
      },
    ],
    totalDuration: 'PT3H30M',
    stops: 0,
    price: 210,
    currency: 'USD',
    cabinClass: 'ECONOMY',
    seatsAvailable: 6,
    source: 'mock',
  },
  {
    id: 'mock-004',
    segments: [
      {
        departureAirport: 'ORD',
        arrivalAirport: 'LAS',
        departureTime: '2025-06-15T09:00:00',
        arrivalTime: '2025-06-15T11:20:00',
        duration: 'PT3H20M',
        flightNumber: 'AA 321',
        airline: 'American Airlines',
        airlineCode: 'AA',
        aircraft: '738',
      },
    ],
    totalDuration: 'PT3H20M',
    stops: 0,
    price: 175,
    currency: 'USD',
    cabinClass: 'ECONOMY',
    seatsAvailable: 3,
    source: 'mock',
  },
  {
    id: 'mock-005',
    segments: [
      {
        departureAirport: 'JFK',
        arrivalAirport: 'LAX',
        departureTime: '2025-06-15T07:00:00',
        arrivalTime: '2025-06-15T10:20:00',
        duration: 'PT5H20M',
        flightNumber: 'B6 101',
        airline: 'JetBlue Airways',
        airlineCode: 'B6',
        aircraft: 'A320',
      },
    ],
    totalDuration: 'PT5H20M',
    stops: 0,
    price: 249,
    currency: 'USD',
    cabinClass: 'ECONOMY',
    seatsAvailable: 12,
    source: 'mock',
  },
  {
    id: 'mock-006',
    segments: [
      {
        departureAirport: 'JFK',
        arrivalAirport: 'LAX',
        departureTime: '2025-06-15T11:00:00',
        arrivalTime: '2025-06-15T14:30:00',
        duration: 'PT5H30M',
        flightNumber: 'DL 401',
        airline: 'Delta Air Lines',
        airlineCode: 'DL',
        aircraft: '757',
      },
    ],
    totalDuration: 'PT5H30M',
    stops: 0,
    price: 319,
    currency: 'USD',
    cabinClass: 'ECONOMY',
    seatsAvailable: 2,
    source: 'mock',
  },
  // Return legs (for round-trip)
  {
    id: 'mock-007',
    segments: [
      {
        departureAirport: 'LAS',
        arrivalAirport: 'DFW',
        departureTime: '2025-06-18T15:00:00',
        arrivalTime: '2025-06-18T19:20:00',
        duration: 'PT2H20M',
        flightNumber: 'AA 5678',
        airline: 'American Airlines',
        airlineCode: 'AA',
        aircraft: '737',
      },
    ],
    totalDuration: 'PT2H20M',
    stops: 0,
    price: 172,
    currency: 'USD',
    cabinClass: 'ECONOMY',
    seatsAvailable: 7,
    source: 'mock',
  },
  {
    id: 'mock-008',
    segments: [
      {
        departureAirport: 'LAS',
        arrivalAirport: 'ORD',
        departureTime: '2025-06-18T16:00:00',
        arrivalTime: '2025-06-18T21:30:00',
        duration: 'PT3H30M',
        flightNumber: 'UA 654',
        airline: 'United Airlines',
        airlineCode: 'UA',
        aircraft: '737',
      },
    ],
    totalDuration: 'PT3H30M',
    stops: 0,
    price: 198,
    currency: 'USD',
    cabinClass: 'ECONOMY',
    seatsAvailable: 5,
    source: 'mock',
  },
];

export function getMockFlights(origin: string, destination: string): FlightOffer[] {
  return MOCK_FLIGHTS.filter(
    (f) =>
      f.segments[0].departureAirport === origin.toUpperCase() &&
      f.segments[f.segments.length - 1].arrivalAirport === destination.toUpperCase()
  );
}
