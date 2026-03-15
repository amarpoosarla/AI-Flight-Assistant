import { getMockFlights } from '@/lib/mock-data';

describe('getMockFlights', () => {
  it('returns flights matching origin and destination', () => {
    const results = getMockFlights('DFW', 'LAS');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((f) => {
      expect(f.segments[0].departureAirport).toBe('DFW');
      expect(f.segments[f.segments.length - 1].arrivalAirport).toBe('LAS');
    });
  });

  it('returns empty array for unknown route', () => {
    const results = getMockFlights('XYZ', 'ABC');
    expect(results).toEqual([]);
  });

  it('is case insensitive', () => {
    const upper = getMockFlights('DFW', 'LAS');
    const lower = getMockFlights('dfw', 'las');
    expect(upper.length).toBe(lower.length);
  });

  it('returns flights with required fields', () => {
    const results = getMockFlights('JFK', 'LAX');
    results.forEach((f) => {
      expect(f.id).toBeTruthy();
      expect(f.price).toBeGreaterThan(0);
      expect(f.segments.length).toBeGreaterThan(0);
      expect(f.source).toBe('mock');
    });
  });
});
