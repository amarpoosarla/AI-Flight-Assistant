import {
  formatPrice,
  formatDuration,
  formatTime,
  arrivalGapMinutes,
  formatMinutes,
  generateId,
} from '@/lib/utils';

describe('formatPrice', () => {
  it('formats USD correctly', () => {
    expect(formatPrice(349)).toBe('$349');
    expect(formatPrice(1200.5, 'USD')).toBe('$1,201');
  });

  it('formats EUR correctly', () => {
    expect(formatPrice(200, 'EUR')).toMatch(/200/);
  });
});

describe('formatDuration', () => {
  it('parses hours and minutes', () => {
    expect(formatDuration('PT5H30M')).toBe('5h 30m');
  });

  it('handles hours only', () => {
    expect(formatDuration('PT2H')).toBe('2h');
  });

  it('handles minutes only', () => {
    expect(formatDuration('PT45M')).toBe('45m');
  });

  it('returns raw string on bad input', () => {
    expect(formatDuration('invalid')).toBe('invalid');
  });
});

describe('formatTime', () => {
  it('returns a valid 12-hour time string', () => {
    // Output depends on local timezone — just assert it matches HH:MM AM/PM pattern
    expect(formatTime('2025-06-15T08:00:00Z')).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/i);
  });
});

describe('arrivalGapMinutes', () => {
  it('computes gap in minutes between two arrival times', () => {
    const gap = arrivalGapMinutes('2025-06-15T10:00:00Z', '2025-06-15T11:30:00Z');
    expect(gap).toBe(90);
  });

  it('returns absolute value regardless of order', () => {
    const a = arrivalGapMinutes('2025-06-15T11:30:00Z', '2025-06-15T10:00:00Z');
    expect(a).toBe(90);
  });
});

describe('formatMinutes', () => {
  it('formats 90 minutes as 1h 30m', () => {
    expect(formatMinutes(90)).toBe('1h 30m');
  });

  it('formats 60 minutes as 1h', () => {
    expect(formatMinutes(60)).toBe('1h');
  });

  it('formats 45 minutes as 45m', () => {
    expect(formatMinutes(45)).toBe('45m');
  });
});

describe('generateId', () => {
  it('generates a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
