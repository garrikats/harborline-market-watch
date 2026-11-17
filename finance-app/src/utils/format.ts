import type { TimeWindowId } from '../config/timeWindows';
import type { PricePoint } from '../services/marketData';

export function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatTime(time: number, window: TimeWindowId): string {
  const date = new Date(time);
  const opts: Intl.DateTimeFormatOptions =
    window === 'day'
      ? { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }
      : window === 'week'
        ? { month: 'short', day: 'numeric', hour: 'numeric', timeZone: 'America/New_York' }
        : { month: 'short', day: 'numeric', timeZone: 'America/New_York' };
  return date.toLocaleString('en-US', opts);
}

/** Percent change from the first to the last point. Returns 0 for fewer than two points. */
export function percentChange(points: readonly PricePoint[]): number {
  if (points.length < 2) return 0;
  const first = points[0].close;
  const last = points[points.length - 1].close;
  return first === 0 ? 0 : ((last - first) / first) * 100;
}
