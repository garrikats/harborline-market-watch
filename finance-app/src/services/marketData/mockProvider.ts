import type { TimeWindowId } from '../../config/timeWindows';
import { TICKERS } from '../../config/tickers';
import { MarketDataError } from './errors';
import type { MarketDataProvider, PricePoint, Series } from './types';

// Fixed anchor so mock output is identical on every run (tests, CI, screenshots).
const ANCHOR = Date.UTC(2026, 10, 16, 21, 0); // 2026-11-16 21:00 UTC (market close, ET)
const MINUTE = 60_000;

const SHAPE: Record<TimeWindowId, { count: number; step: number }> = {
  day: { count: 78, step: 5 * MINUTE },
  week: { count: 35, step: 60 * MINUTE },
  quarter: { count: 63, step: 24 * 60 * MINUTE },
};

const BASE_PRICE: Record<string, number> = { UNH: 520, ELV: 340, CI: 290, CVS: 62, HUM: 270 };

function hash(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

// Small seeded PRNG (mulberry32) so each symbol/window gets a stable random walk.
function prng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateMockSeries(symbol: string, window: TimeWindowId): Series {
  const { count, step } = SHAPE[window];
  const random = prng(hash(`${symbol}:${window}`));
  let price = BASE_PRICE[symbol] ?? 100;
  const points: PricePoint[] = [];
  for (let i = 0; i < count; i++) {
    price *= 1 + (random() - 0.5) * 0.01;
    points.push({
      time: ANCHOR - (count - 1 - i) * step,
      close: Math.round(price * 100) / 100,
    });
  }
  return { symbol, window, points };
}

/** Deterministic offline provider. Used when VITE_USE_MOCK is not "false" and in all tests. */
export const mockProvider: MarketDataProvider = {
  async getSeries(symbol, window) {
    if (!TICKERS.some((t) => t.symbol === symbol)) {
      throw new MarketDataError('not_found', `Unknown symbol ${symbol}`);
    }
    return generateMockSeries(symbol, window);
  },
};
