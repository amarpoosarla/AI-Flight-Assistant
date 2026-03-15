import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parseISO, differenceInMinutes, format } from 'date-fns';

// Merges Tailwind classes without conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price for display: 349 → "$349" or "€349"
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Parse ISO 8601 duration "PT5H30M" → "5h 30m"
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return isoDuration;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// Format ISO datetime to readable time: "2025-06-15T08:00:00Z" → "8:00 AM"
export function formatTime(isoDatetime: string): string {
  return format(parseISO(isoDatetime), 'h:mm a');
}

// Format ISO datetime to short date: "2025-06-15T08:00:00Z" → "Jun 15"
export function formatShortDate(isoDatetime: string): string {
  return format(parseISO(isoDatetime), 'MMM d');
}

// Compute arrival gap between two ISO datetimes in minutes
export function arrivalGapMinutes(timeA: string, timeB: string): number {
  return Math.abs(differenceInMinutes(parseISO(timeA), parseISO(timeB)));
}

// Format minutes as "Xh Ym" for display
export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Generate a unique ID (for client-side use only, e.g. chat messages)
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
