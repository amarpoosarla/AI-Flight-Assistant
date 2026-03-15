'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/flightStore';
import FlightDetail from '@/components/flights/FlightDetail';
import type { FlightOffer } from '@/types/flight';

function Skeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse space-y-4">
      <div className="h-6 w-48 bg-slate-200 rounded" />
      <div className="h-4 w-32 bg-slate-200 rounded" />
      <div className="h-32 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-200 rounded-xl" />
    </div>
  );
}

export default function FlightDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const selectedFlight = useFlightStore((s) => s.selectedFlight);
  const [flight, setFlight] = useState<FlightOffer | null>(selectedFlight);
  const [loading, setLoading] = useState(!selectedFlight);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have the flight from store (normal navigation flow), skip fetch
    if (selectedFlight?.id === id) {
      setFlight(selectedFlight);
      setLoading(false);
      return;
    }

    // Direct URL access (refresh / bookmark) — fetch from server-side cache
    fetch(`/api/flights/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Flight not found');
        return data;
      })
      .then((data) => {
        setFlight(data.flight);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, selectedFlight]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading && <Skeleton />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 font-medium mb-3">{error}</p>
            <button
              type="button"
              onClick={() => router.push('/flights')}
              className="text-sm text-brand-600 hover:underline"
            >
              Back to search
            </button>
          </div>
        )}

        {!loading && !error && flight && <FlightDetail flight={flight} />}
      </div>
    </main>
  );
}
