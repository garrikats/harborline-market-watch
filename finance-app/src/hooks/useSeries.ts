import { useEffect, useState } from 'react';
import type { TimeWindowId } from '../config/timeWindows';
import { marketData, toMarketDataError, type MarketDataError, type Series } from '../services/marketData';

export type SeriesState =
  | { status: 'loading' }
  | { status: 'success'; series: Series }
  | { status: 'error'; error: MarketDataError };

interface Settled {
  key: string;
  state: Exclude<SeriesState, { status: 'loading' }>;
}

/** Loads one symbol/window. Each card calls this itself, so one failing ticker never blanks the page. */
export function useSeries(symbol: string, window: TimeWindowId): SeriesState {
  const key = `${symbol}:${window}`;
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    marketData
      .getSeries(symbol, window, controller.signal)
      .then((series) => setSettled({ key, state: { status: 'success', series } }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setSettled({ key, state: { status: 'error', error: toMarketDataError(err) } });
      });
    return () => controller.abort();
  }, [symbol, window, key]);

  // Anything not yet settled for the current key (including a stale previous key) is loading.
  return settled?.key === key ? settled.state : { status: 'loading' };
}
