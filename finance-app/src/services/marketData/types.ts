import type { TimeWindowId } from '../../config/timeWindows';

export interface PricePoint {
  /** Epoch milliseconds. */
  time: number;
  close: number;
}

export interface Series {
  symbol: string;
  window: TimeWindowId;
  points: PricePoint[];
}

export interface MarketDataProvider {
  getSeries(symbol: string, window: TimeWindowId, signal?: AbortSignal): Promise<Series>;
}
