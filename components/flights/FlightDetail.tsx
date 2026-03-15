'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle2, Plane } from 'lucide-react';
import { cn, formatPrice, formatDuration, formatTime, formatShortDate } from '@/lib/utils';
import type { FlightOffer, FlightSegment } from '@/types/flight';

interface Props {
  flight: FlightOffer;
}

function SegmentRow({ seg }: { seg: FlightSegment }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full border-2 border-brand-500 bg-white mt-1" />
        <div className="w-px flex-1 bg-slate-200 my-1 min-h-8" />
        <div className="w-3 h-3 rounded-full bg-brand-500" />
      </div>
      <div className="flex-1 pb-4">
        <div className="flex justify-between">
          <div>
            <p className="text-base font-bold text-slate-900">{formatTime(seg.departureTime)}</p>
            <p className="text-sm text-slate-500">
              {seg.departureAirport} · {formatShortDate(seg.departureTime)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 flex items-center justify-end gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(seg.duration)}
            </p>
            <p className="text-xs text-slate-400">{seg.flightNumber}</p>
            {seg.aircraft && <p className="text-xs text-slate-400">{seg.aircraft}</p>}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-base font-bold text-slate-900">{formatTime(seg.arrivalTime)}</p>
          <p className="text-sm text-slate-500">
            {seg.arrivalAirport} · {formatShortDate(seg.arrivalTime)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FlightDetail({ flight }: Props) {
  const router = useRouter();
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seg = flight.segments[0];
  const lastSeg = flight.segments[flight.segments.length - 1];

  async function handleBook() {
    setBooking(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: flight.id,
          origin: seg.departureAirport,
          destination: lastSeg.arrivalAirport,
          departureAt: seg.departureTime,
          arrivalAt: lastSeg.arrivalTime,
          airline: seg.airline,
          flightNumber: seg.flightNumber,
          cabinClass: flight.cabinClass,
          passengers: 1,
          totalPrice: flight.price,
          currency: flight.currency,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Booking failed');
      }

      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  }

  if (confirmed) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
        <p className="text-slate-500 mb-1">
          {seg.airline} · {seg.flightNumber}
        </p>
        <p className="text-slate-500 mb-6">
          {seg.departureAirport} → {lastSeg.arrivalAirport} · {formatShortDate(seg.departureTime)}
        </p>
        <p className="text-2xl font-bold text-slate-900 mb-6">
          {formatPrice(flight.price, flight.currency)}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => router.push('/account/bookings')}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            View My Bookings
          </button>
          <button
            type="button"
            onClick={() => router.push('/flights')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Search Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to results
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Plane className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-600">{seg.airline}</span>
              <span className="text-xs text-slate-400">{seg.flightNumber}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {seg.departureAirport} → {lastSeg.arrivalAirport}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(flight.totalDuration)} ·{' '}
              {flight.stops === 0
                ? 'Nonstop'
                : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {formatPrice(flight.price, flight.currency)}
            </p>
            <p className="text-xs text-slate-400">per person · {flight.cabinClass}</p>
          </div>
        </div>

        {/* Outbound segments */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Outbound
          </p>
          {flight.segments.map((seg, i) => (
            <SegmentRow key={i} seg={seg} />
          ))}
        </div>

        {/* Return segments */}
        {flight.returnSegments && flight.returnSegments.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Return
            </p>
            {flight.returnSegments.map((seg, i) => (
              <SegmentRow key={i} seg={seg} />
            ))}
          </div>
        )}

        {/* Fare info */}
        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
          <p>
            <span className="font-medium">Cabin:</span> {flight.cabinClass}
          </p>
          <p>
            <span className="font-medium">Source:</span>{' '}
            {flight.source === 'amadeus' ? 'Live Amadeus data' : 'Demo data'}
          </p>
          {flight.seatsAvailable !== undefined && (
            <p className={cn(flight.seatsAvailable <= 5 ? 'text-red-600 font-medium' : '')}>
              <span className="font-medium">Seats available:</span> {flight.seatsAvailable}
            </p>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleBook}
          disabled={booking}
          className={cn(
            'w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-3.5 font-semibold',
            'transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          )}
        >
          {booking && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {booking ? 'Confirming...' : `Book for ${formatPrice(flight.price, flight.currency)}`}
        </button>
      </div>
    </div>
  );
}
