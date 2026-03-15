'use client';

import { useFlightStore } from '@/store/flightStore';
import type { SearchParams } from '@/types/flight';

export function useFlightSearch() {
  const { setResults, setLoading, setError, setSearchParams } = useFlightStore();

  async function search(params: SearchParams) {
    setLoading(true);
    setError(null);
    setSearchParams(params);

    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: params.origin,
          destination: params.destination,
          departureDate: params.departureDate,
          returnDate: params.returnDate,
          adults: params.adults,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Search failed');
      }

      const data = await res.json();
      setResults(data.flights ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return { search };
}
