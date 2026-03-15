import { resolveAirport, resolveAirportForTool } from '@/lib/airports';

describe('resolveAirport', () => {
  it('resolves exact IATA code (uppercase)', () => {
    expect(resolveAirport('JFK')?.iata).toBe('JFK');
  });

  it('resolves exact IATA code (lowercase)', () => {
    expect(resolveAirport('jfk')?.iata).toBe('JFK');
  });

  it('resolves city name', () => {
    expect(resolveAirport('Chicago')?.iata).toBe('ORD');
  });

  it('resolves city name case-insensitively', () => {
    expect(resolveAirport('chicago')?.iata).toBe('ORD');
  });

  it('resolves alias "Vegas" to LAS', () => {
    expect(resolveAirport('Vegas')?.iata).toBe('LAS');
  });

  it('resolves alias "dallas" to DFW', () => {
    expect(resolveAirport('dallas')?.iata).toBe('DFW');
  });

  it('returns null for unknown input', () => {
    expect(resolveAirport('Nowhere City')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(resolveAirport('')).toBeNull();
  });
});

describe('resolveAirportForTool', () => {
  it('returns found:true with IATA for known airport', () => {
    const result = resolveAirportForTool('Las Vegas');
    expect(result.found).toBe(true);
    expect(result.iata).toBe('LAS');
    expect(result.city).toBe('Las Vegas');
  });

  it('returns found:false with message for unknown input', () => {
    const result = resolveAirportForTool('Gondor International');
    expect(result.found).toBe(false);
    expect(result.message).toContain('No airport found');
  });
});
