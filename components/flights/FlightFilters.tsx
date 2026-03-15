'use client';

import { useFlightStore } from '@/store/flightStore';
import { formatPrice } from '@/lib/utils';

export default function FlightFilters() {
  const { filters, setFilters, resetFilters, results } = useFlightStore();

  const maxResultPrice = results.length > 0 ? Math.max(...results.map((f) => f.price)) : 2000;
  const currency = results[0]?.currency ?? 'USD';

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 text-sm">Filters</h3>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs text-brand-600 hover:underline font-medium"
        >
          Reset
        </button>
      </div>

      {/* Stops */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Stops</p>
        <div className="space-y-2">
          {[
            { label: 'Any', value: null },
            { label: 'Nonstop only', value: 0 },
            { label: '1 stop or fewer', value: 1 },
          ].map(({ label, value }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="stops"
                className="accent-brand-600"
                checked={filters.maxStops === value}
                onChange={() => setFilters({ maxStops: value })}
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Max price */}
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Max Price</p>
          <p className="text-xs font-medium text-slate-700">
            {filters.maxPrice === null ? 'Any' : formatPrice(filters.maxPrice, currency)}
          </p>
        </div>
        <input
          type="range"
          min={50}
          max={maxResultPrice}
          step={10}
          value={filters.maxPrice ?? maxResultPrice}
          onChange={(e) => setFilters({ maxPrice: Number(e.target.value) })}
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{formatPrice(50, currency)}</span>
          <span>{formatPrice(maxResultPrice, currency)}</span>
        </div>
      </div>

      {/* Max duration */}
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Max Duration
          </p>
          <p className="text-xs font-medium text-slate-700">
            {filters.maxDurationHours === null ? 'Any' : `${filters.maxDurationHours}h`}
          </p>
        </div>
        <input
          type="range"
          min={1}
          max={24}
          step={1}
          value={filters.maxDurationHours ?? 24}
          onChange={(e) => setFilters({ maxDurationHours: Number(e.target.value) })}
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>1h</span>
          <span>24h</span>
        </div>
      </div>
    </aside>
  );
}
