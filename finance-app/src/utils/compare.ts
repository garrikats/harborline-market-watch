import type { PricePoint } from '../services/marketData';

export interface ComparisonRow {
  time: number;
  /** Selected company, percent change from its first point. */
  selected: number;
  /** Baseline (UNH), percent change from its first point; null before its first point. */
  baseline: number | null;
}

function rebase(points: readonly PricePoint[]): PricePoint[] {
  const first = points[0]?.close ?? 0;
  return points.map((p) => ({ time: p.time, close: first === 0 ? 0 : (p.close / first - 1) * 100 }));
}

/**
 * Builds one row per selected-company point. Both series are rebased to percent change so
 * different price levels share an axis. The baseline is carried forward from its latest point
 * at or before each timestamp, so slightly different live timestamps still line up.
 */
export function buildComparisonRows(
  selected: readonly PricePoint[],
  baseline: readonly PricePoint[],
): ComparisonRow[] {
  const base = rebase(baseline);
  let i = 0;
  return rebase(selected).map(({ time, close }) => {
    while (i + 1 < base.length && base[i + 1].time <= time) i++;
    const hasBaseline = base.length > 0 && base[i].time <= time;
    return { time, selected: close, baseline: hasBaseline ? base[i].close : null };
  });
}
