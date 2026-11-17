import type { TimeWindowId } from '../../config/timeWindows';
import { MarketDataError } from './errors';
import type { Series } from './types';

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: { quote?: Array<{ close?: Array<number | null> }> };
    }> | null;
    error?: { code?: string; description?: string } | null;
  };
}

/** Converts a Yahoo chart payload to the app's Series. The only place that knows Yahoo's shape. */
export function normalizeYahooChart(
  payload: unknown,
  symbol: string,
  window: TimeWindowId,
): Series {
  const chart = (payload as YahooChartResponse | null)?.chart;
  if (!chart) throw new MarketDataError('parse', 'Missing "chart" in Yahoo response');

  if (chart.error) {
    const kind = chart.error.code === 'Not Found' ? 'not_found' : 'upstream';
    throw new MarketDataError(kind, chart.error.description ?? 'Yahoo returned an error');
  }

  const result = chart.result?.[0];
  const timestamps = result?.timestamp;
  const closes = result?.indicators?.quote?.[0]?.close;
  if (!result || !Array.isArray(timestamps) || !Array.isArray(closes)) {
    throw new MarketDataError('parse', 'Unexpected Yahoo response shape');
  }

  const points = timestamps.flatMap((t, i) => {
    const close = closes[i];
    return typeof close === 'number' ? [{ time: t * 1000, close }] : [];
  });

  if (points.length === 0) {
    throw new MarketDataError('empty', `No price data for ${symbol}`);
  }
  return { symbol, window, points };
}
