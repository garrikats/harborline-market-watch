import { describe, expect, it } from 'vitest';
import { MarketDataError } from './errors';
import { normalizeYahooChart } from './normalize';

const ok = (timestamp: number[], close: Array<number | null>) => ({
  chart: { result: [{ timestamp, indicators: { quote: [{ close }] } }], error: null },
});

describe('normalizeYahooChart', () => {
  it('maps timestamps to milliseconds and skips null closes', () => {
    const series = normalizeYahooChart(ok([100, 200, 300], [1.5, null, 3.5]), 'UNH', 'day');
    expect(series).toEqual({
      symbol: 'UNH',
      window: 'day',
      points: [
        { time: 100_000, close: 1.5 },
        { time: 300_000, close: 3.5 },
      ],
    });
  });

  it('throws not_found for a Yahoo "Not Found" error', () => {
    const payload = { chart: { result: null, error: { code: 'Not Found', description: 'No data' } } };
    expect(() => normalizeYahooChart(payload, 'ZZZ', 'day')).toThrow(MarketDataError);
    try {
      normalizeYahooChart(payload, 'ZZZ', 'day');
    } catch (e) {
      expect((e as MarketDataError).kind).toBe('not_found');
    }
  });

  it('throws empty when every close is null', () => {
    expect(() => normalizeYahooChart(ok([1, 2], [null, null]), 'UNH', 'day')).toThrow(/No price data/);
  });

  it.each([null, {}, { chart: { result: [{}] } }])('throws parse for malformed payload %j', (payload) => {
    try {
      normalizeYahooChart(payload, 'UNH', 'day');
      expect.unreachable();
    } catch (e) {
      expect((e as MarketDataError).kind).toBe('parse');
    }
  });
});
