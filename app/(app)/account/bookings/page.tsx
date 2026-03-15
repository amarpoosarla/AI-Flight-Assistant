'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Ticket } from 'lucide-react';
import { formatPrice, formatShortDate, formatTime } from '@/lib/utils';
import type { Booking } from '@/types/flight';

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-slate-900">
            {booking.origin} → {booking.destination}
          </p>
          <p className="text-sm text-slate-500">
            {booking.airline} · {booking.flightNumber}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            booking.status === 'confirmed'
              ? 'bg-green-50 text-green-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {booking.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
        <span>
          {formatShortDate(booking.departureAt)} · {formatTime(booking.departureAt)}
        </span>
        <span className="text-slate-300">→</span>
        <span>{formatTime(booking.arrivalAt)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">
          {booking.passengers} {booking.passengers === 1 ? 'passenger' : 'passengers'} ·{' '}
          {booking.cabinClass}
        </span>
        <span className="font-bold text-slate-900">
          {formatPrice(booking.totalPrice, booking.currency)}
        </span>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => {
        setBookings(data.bookings ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => router.push('/flights')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to search
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Bookings</h1>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse h-28"
              />
            ))}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-700 mb-1">No bookings yet</p>
            <p className="text-sm text-slate-400 mb-4">Your confirmed flights will appear here.</p>
            <button
              type="button"
              onClick={() => router.push('/flights')}
              className="text-sm text-brand-600 hover:underline font-medium"
            >
              Search flights
            </button>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
