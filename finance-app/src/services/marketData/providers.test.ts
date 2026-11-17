import { describe, expect, it } from 'vitest';
import { TICKERS } from '../../config/tickers';
import { TIME_WINDOWS } from '../../config/timeWindows';
import { generateMockSeries, mockProvider } from './mockProvider';
import { selectProvider } from './index';
import { buildYahooUrl, yahooProvider } from './yahooProvider';

describe('mockProvider', () => {
  it('is deterministic for a symbol and window', () => {
    expect(generateMockSeries('UNH', 'week')).toEqual(generateMockSeries('UNH', 'week'));
  });

  it('returns ordered, positive points for every ticker and window', async () => {
    for (const { symbol } of TICKERS) {
      for (const { id } of TIME_WINDOWS) {
        const { points } = await mockProvider.getSeries(symbol, id);
        expect(points.length).toBeGreaterThan(1);
        expect(points.every((p) => p.close > 0)).toBe(true);
        expect(points.every((p, i) => i === 0 || p.time > points[i - 1].time)).toBe(true);
      }
    }
  });

  it('rejects unknown symbols with not_found', async () => {
    await expect(mockProvider.getSeries('ZZZ', 'day')).rejects.toMatchObject({ kind: 'not_found' });
  });
});

describe('selectProvider (VITE_USE_MOCK seam)', () => {
  it.each(['true', undefined, ''])('uses the mock provider for %j', (flag) => {
    expect(selectProvider(flag)).toBe(mockProvider);
  });

  it('uses the Yahoo provider only when explicitly "false"', () => {
    expect(selectProvider('false')).toBe(yahooProvider);
  });
});

describe('buildYahooUrl', () => {
  it('uses range for day and quarter windows', () => {
    expect(buildYahooUrl('UNH', 'day')).toBe('/api/yahoo/v8/finance/chart/UNH?interval=5m&range=1d');
    expect(buildYahooUrl('UNH', 'quarter')).toBe('/api/yahoo/v8/finance/chart/UNH?interval=1d&range=3mo');
  });

  it('uses 7 calendar days of period1/period2 for the week window', () => {
    const now = 1_700_000_000_000;
    const url = new URL(buildYahooUrl('CI', 'week', now), 'http://localhost');
    const period2 = Number(url.searchParams.get('period2'));
    const period1 = Number(url.searchParams.get('period1'));
    expect(period2).toBe(1_700_000_000);
    expect(period2 - period1).toBe(7 * 86_400);
    expect(url.searchParams.get('interval')).toBe('1h');
  });
});
