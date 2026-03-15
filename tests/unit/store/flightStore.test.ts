import { useFlightStore } from '@/store/flightStore';
import type { FlightOffer } from '@/types/flight';

const makeFlight = (overrides: Partial<FlightOffer>): FlightOffer => ({
  id: 'f1',
  segments: [
    {
      departureAirport: 'JFK',
      arrivalAirport: 'LAX',
      departureTime: '2025-06-15T08:00:00',
      arrivalTime: '2025-06-15T13:30:00',
      duration: 'PT5H30M',
      flightNumber: 'DL 1',
      airline: 'Delta',
      airlineCode: 'DL',
    },
  ],
  totalDuration: 'PT5H30M',
  stops: 0,
  price: 300,
  currency: 'USD',
  cabinClass: 'ECONOMY',
  source: 'mock',
  ...overrides,
});

beforeEach(() => {
  useFlightStore.getState().setResults([]);
  useFlightStore.getState().resetFilters();
});

describe('duration filter', () => {
  it('excludes flights that exceed maxDurationHours including minutes', () => {
    // 5h max — should exclude PT5H30M (330min > 300min)
    useFlightStore.getState().setResults([makeFlight({ totalDuration: 'PT5H30M' })]);
    useFlightStore.getState().setFilters({ maxDurationHours: 5 });
    expect(useFlightStore.getState().filteredResults()).toHaveLength(0);
  });

  it('includes flights exactly at the limit', () => {
    // 6h max — should include PT5H30M (330min <= 360min)
    useFlightStore.getState().setResults([makeFlight({ totalDuration: 'PT5H30M' })]);
    useFlightStore.getState().setFilters({ maxDurationHours: 6 });
    expect(useFlightStore.getState().filteredResults()).toHaveLength(1);
  });

  it('handles minutes-only durations', () => {
    useFlightStore.getState().setResults([makeFlight({ totalDuration: 'PT45M' })]);
    useFlightStore.getState().setFilters({ maxDurationHours: 1 });
    expect(useFlightStore.getState().filteredResults()).toHaveLength(1);
  });
});

describe('price filter', () => {
  it('excludes flights above maxPrice', () => {
    useFlightStore.getState().setResults([makeFlight({ price: 500 })]);
    useFlightStore.getState().setFilters({ maxPrice: 400 });
    expect(useFlightStore.getState().filteredResults()).toHaveLength(0);
  });

  it('includes flights at or below maxPrice', () => {
    useFlightStore.getState().setResults([makeFlight({ price: 400 })]);
    useFlightStore.getState().setFilters({ maxPrice: 400 });
    expect(useFlightStore.getState().filteredResults()).toHaveLength(1);
  });
});

describe('stops filter', () => {
  it('filters to nonstop only when maxStops is 0', () => {
    useFlightStore.getState().setResults([
      makeFlight({ id: 'a', stops: 0 }),
      makeFlight({ id: 'b', stops: 1 }),
    ]);
    useFlightStore.getState().setFilters({ maxStops: 0 });
    const results = useFlightStore.getState().filteredResults();
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('a');
  });
});
