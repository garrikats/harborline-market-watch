import { mockProvider } from './mockProvider';
import type { MarketDataProvider } from './types';
import { yahooProvider } from './yahooProvider';

/** The mock/live seam. Mock is the default; only an explicit VITE_USE_MOCK=false goes live. */
export function selectProvider(useMock: string | undefined): MarketDataProvider {
  return useMock === 'false' ? yahooProvider : mockProvider;
}

export const marketData: MarketDataProvider = selectProvider(import.meta.env.VITE_USE_MOCK);

export { MarketDataError, toMarketDataError } from './errors';
export type { MarketDataErrorKind } from './errors';
export type { MarketDataProvider, PricePoint, Series } from './types';
