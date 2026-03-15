'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlaneTakeoff, PlaneLanding, Calendar, Users, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlightSearch } from '@/hooks/useFlightSearch';
import type { SearchParams, TripType } from '@/types/flight';

// Use local date (not UTC) so "today" is correct in all timezones including US evening hours
function getLocalDateString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
const today = getLocalDateString();

export default function SearchForm() {
  const router = useRouter();
  const { search } = useFlightSearch();

  const [tripType, setTripType] = useState<TripType>('round-trip');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [loading, setLoading] = useState(false);

  function swapAirports() {
    setOrigin(destination);
    setDestination(origin);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const params: SearchParams = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : undefined,
      adults,
      tripType,
    };

    await search(params);
    setLoading(false);
    router.push('/flights/results');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
    >
      {/* Trip type toggle */}
      <div className="flex gap-2 mb-6">
        {(['one-way', 'round-trip'] as TripType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTripType(type)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              tripType === type
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {type === 'one-way' ? 'One Way' : 'Round Trip'}
          </button>
        ))}
      </div>

      {/* Airport inputs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            required
            maxLength={3}
            placeholder="From (e.g. JFK)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-lg text-sm uppercase font-medium placeholder:font-normal placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={swapAirports}
          className="self-center p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          aria-label="Swap airports"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <div className="flex-1 relative">
          <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            required
            maxLength={3}
            placeholder="To (e.g. LAX)"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-lg text-sm uppercase font-medium placeholder:font-normal placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Dates + passengers */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            required
            min={today}
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {tripType === 'round-trip' && (
          <div className="flex-1 relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              required
              min={departureDate || today}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="relative sm:w-36">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white appearance-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'Adult' : 'Adults'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-3.5 font-semibold text-sm',
          'transition-colors',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {loading ? 'Searching...' : 'Search Flights'}
      </button>
    </form>
  );
}
