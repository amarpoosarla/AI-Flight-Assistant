'use client';

import { useRouter } from 'next/navigation';
import { Clock, Wifi } from 'lucide-react';
import { cn, formatPrice, formatDuration, formatTime, formatShortDate } from '@/lib/utils';
import { useFlightStore } from '@/store/flightStore';
import type { FlightOffer } from '@/types/flight';

interface Props {
  flight: FlightOffer;
}

// Airline logo using a simple initial badge (no external image dependency)
function AirlineBadge({ code, name }: { code: string; name: string }) {
  return (
    <div
      className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0"
      title={name}
    >
      <span className="text-xs font-bold text-brand-700">{code}</span>
    </div>
  );
}

function StopsLabel({ stops }: { stops: number }) {
  if (stops === 0)
    return (
      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
        Nonstop
      </span>
    );
  return (
    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
      {stops} stop{stops > 1 ? 's' : ''}
    </span>
  );
}

export default function FlightCard({ flight }: Props) {
  const router = useRouter();
  const setSelectedFlight = useFlightStore((s) => s.setSelectedFlight);

  const seg = flight.segments[0];
  const lastSeg = flight.segments[flight.segments.length - 1];

  function handleSelect() {
    setSelectedFlight(flight);
    // Write to server-side cache so direct URL access and refresh work
    fetch('/api/flights/cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offer: flight }),
    }).catch(() => {
      // Non-critical — in-session navigation still works via Zustand store
    });
    router.push(`/flights/${flight.id}`);
  }

  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-2xl p-4 sm:p-5',
        'hover:border-brand-300 hover:shadow-md transition-all cursor-pointer',
        'flex flex-col sm:flex-row sm:items-center gap-4'
      )}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
      aria-label={`${flight.segments[0].airline} flight from ${seg.departureAirport} to ${lastSeg.arrivalAirport}, ${formatPrice(flight.price, flight.currency)}`}
    >
      {/* Airline */}
      <div className="flex items-center gap-3 sm:w-36">
        <AirlineBadge code={seg.airlineCode} name={seg.airline} />
        <div>
          <p className="text-sm font-medium text-slate-900 leading-tight">{seg.airline}</p>
          <p className="text-xs text-slate-400">{seg.flightNumber}</p>
        </div>
      </div>

      {/* Route + times */}
      <div className="flex-1 flex items-center gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{formatTime(seg.departureTime)}</p>
          <p className="text-xs font-semibold text-slate-500">{seg.departureAirport}</p>
          <p className="text-xs text-slate-400">{formatShortDate(seg.departureTime)}</p>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(flight.totalDuration)}
          </p>
          <div className="w-full flex items-center my-1">
            <div className="h-px flex-1 bg-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-1" />
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <StopsLabel stops={flight.stops} />
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{formatTime(lastSeg.arrivalTime)}</p>
          <p className="text-xs font-semibold text-slate-500">{lastSeg.arrivalAirport}</p>
          <p className="text-xs text-slate-400">{formatShortDate(lastSeg.arrivalTime)}</p>
        </div>
      </div>

      {/* Amenities placeholder */}
      <div className="hidden sm:flex items-center gap-2 text-slate-300">
        <Wifi className="w-4 h-4" />
      </div>

      {/* Price + CTA */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:w-28">
        <div className="text-right">
          <p className="text-xl font-bold text-slate-900">
            {formatPrice(flight.price, flight.currency)}
          </p>
          <p className="text-xs text-slate-400">per person</p>
        </div>
        {flight.seatsAvailable !== undefined && flight.seatsAvailable <= 5 && (
          <p className="text-xs text-red-500 font-medium">
            {flight.seatsAvailable} seat{flight.seatsAvailable === 1 ? '' : 's'} left
          </p>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelect();
          }}
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          Select
        </button>
      </div>
    </div>
  );
}
