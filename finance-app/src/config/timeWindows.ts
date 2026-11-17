export type TimeWindowId = 'day' | 'week' | 'quarter';

export interface TimeWindow {
  id: TimeWindowId;
  label: string;
  /** Yahoo bar size. */
  interval: string;
  /** Yahoo `range` value. Mutually exclusive with `lookbackDays`. */
  range?: string;
  /** Calendar days back from now, sent as period1/period2. */
  lookbackDays?: number;
}

// Single source of truth for how each dashboard view maps to a Yahoo query.
export const TIME_WINDOWS: readonly TimeWindow[] = [
  { id: 'day', label: 'Current day', range: '1d', interval: '5m' },
  { id: 'week', label: 'Last 7 days', lookbackDays: 7, interval: '1h' },
  { id: 'quarter', label: 'Last quarter', range: '3mo', interval: '1d' },
];

export const DEFAULT_WINDOW: TimeWindowId = 'day';

export function getTimeWindow(id: TimeWindowId): TimeWindow {
  const window = TIME_WINDOWS.find((w) => w.id === id);
  if (!window) throw new Error(`Unknown time window: ${id}`);
  return window;
}
