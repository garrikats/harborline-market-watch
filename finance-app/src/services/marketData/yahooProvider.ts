import { getTimeWindow, type TimeWindowId } from '../../config/timeWindows';
import { MarketDataError } from './errors';
import { normalizeYahooChart } from './normalize';
import type { MarketDataProvider, Series } from './types';

const BASE_URL = '/api/yahoo/v8/finance/chart';

export function buildYahooUrl(symbol: string, windowId: TimeWindowId, now = Date.now()): string {
  const { range, lookbackDays, interval } = getTimeWindow(windowId);
  const params = new URLSearchParams({ interval });
  if (lookbackDays) {
    const period2 = Math.floor(now / 1000);
    params.set('period1', String(period2 - lookbackDays * 86_400));
    params.set('period2', String(period2));
  } else if (range) {
    params.set('range', range);
  }
  return `${BASE_URL}/${encodeURIComponent(symbol)}?${params}`;
}

/** Live provider. Calls the local Vite proxy at /api/yahoo (see vite.config.ts). */
export const yahooProvider: MarketDataProvider = {
  async getSeries(symbol, window, signal): Promise<Series> {
    let response: Response;
    try {
      response = await fetch(buildYahooUrl(symbol, window), { signal });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new MarketDataError('network', 'Network request failed');
    }

    if (response.status === 429) throw new MarketDataError('rate_limited', 'Rate limited by Yahoo');
    if (response.status === 404) throw new MarketDataError('not_found', `Unknown symbol ${symbol}`);

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new MarketDataError(response.ok ? 'parse' : 'upstream', `HTTP ${response.status}`);
    }
    // Yahoo reports most errors inside the JSON body, so normalize before checking status.
    if (!response.ok && !(payload as { chart?: { error?: unknown } })?.chart?.error) {
      throw new MarketDataError('upstream', `HTTP ${response.status}`);
    }
    return normalizeYahooChart(payload, symbol, window);
  },
};
