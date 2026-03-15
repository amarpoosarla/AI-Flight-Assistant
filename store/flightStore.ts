import { create } from 'zustand';
import type { FlightOffer, SearchParams } from '@/types/flight';

interface FlightFilters {
  maxPrice: number | null;
  maxStops: number | null; // 0 = nonstop only, 1 = 1 stop, null = any
  maxDurationHours: number | null;
}

interface FlightStore {
  // Search params
  searchParams: SearchParams | null;
  setSearchParams: (params: SearchParams) => void;

  // Results
  results: FlightOffer[];
  setResults: (flights: FlightOffer[]) => void;

  // Loading / error state
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (msg: string | null) => void;

  // Filters
  filters: FlightFilters;
  setFilters: (filters: Partial<FlightFilters>) => void;
  resetFilters: () => void;

  // Selected flight (for detail / checkout)
  selectedFlight: FlightOffer | null;
  setSelectedFlight: (flight: FlightOffer | null) => void;

  // Derived: filtered results
  filteredResults: () => FlightOffer[];
}

const DEFAULT_FILTERS: FlightFilters = {
  maxPrice: null,
  maxStops: null,
  maxDurationHours: null,
};

export const useFlightStore = create<FlightStore>((set, get) => ({
  searchParams: null,
  setSearchParams: (params) => set({ searchParams: params }),

  results: [],
  setResults: (flights) => set({ results: flights }),

  loading: false,
  setLoading: (v) => set({ loading: v }),

  error: null,
  setError: (msg) => set({ error: msg }),

  filters: DEFAULT_FILTERS,
  setFilters: (partial) => set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  selectedFlight: null,
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),

  filteredResults: () => {
    const { results, filters } = get();
    return results.filter((f) => {
      if (filters.maxPrice !== null && f.price > filters.maxPrice) return false;
      if (filters.maxStops !== null && f.stops > filters.maxStops) return false;
      if (filters.maxDurationHours !== null) {
        const match = f.totalDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        if (match) {
          const hours = parseInt(match[1] ?? '0', 10);
          const minutes = parseInt(match[2] ?? '0', 10);
          const totalMinutes = hours * 60 + minutes;
          if (totalMinutes > filters.maxDurationHours * 60) return false;
        }
      }
      return true;
    });
  },
}));
