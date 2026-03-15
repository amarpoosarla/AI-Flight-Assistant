'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft, Plane } from 'lucide-react';
import { useFlightStore } from '@/store/flightStore';
import FlightCard from '@/components/flights/FlightCard';
import FlightFilters from '@/components/flights/FlightFilters';

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-slate-200" />
        <div className="space-y-2">
          <div className="h-3 w-28 bg-slate-200 rounded" />
          <div className="h-2 w-16 bg-slate-200 rounded" />
        </div>
        <div className="flex-1" />
        <div className="h-6 w-20 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { loading, error, searchParams, filteredResults } = useFlightStore();
  const flights = filteredResults();

  // If someone navigates directly to /flights/results without searching, redirect
  useEffect(() => {
    if (!loading && !searchParams) {
      router.replace('/flights');
    }
  }, [loading, searchParams, router]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => router.push('/flights')}
            className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
            aria-label="Back to search"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {searchParams && (
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {searchParams.origin} → {searchParams.destination}
              </h1>
              <p className="text-sm text-slate-500">
                {searchParams.departureDate}
                {searchParams.returnDate && ` · Return ${searchParams.returnDate}`}
                {` · ${searchParams.adults} ${searchParams.adults === 1 ? 'adult' : 'adults'}`}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <FlightFilters />
          </div>

          {/* Results */}
          <div className="flex-1 space-y-3">
            {loading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-700 font-medium mb-1">Search failed</p>
                <p className="text-sm text-red-500">{error}</p>
                <button
                  type="button"
                  onClick={() => router.push('/flights')}
                  className="mt-4 text-sm text-brand-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && flights.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <Plane className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-medium text-slate-700 mb-1">No flights found</p>
                <p className="text-sm text-slate-400">
                  Try adjusting your filters or search different dates.
                </p>
              </div>
            )}

            {!loading && !error && flights.length > 0 && (
              <>
                <p className="text-sm text-slate-500 mb-2">
                  {flights.length} flight{flights.length !== 1 ? 's' : ''} found · sorted by price
                </p>
                {[...flights]
                  .sort((a, b) => a.price - b.price)
                  .map((flight) => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
