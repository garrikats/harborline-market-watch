export type MarketDataErrorKind =
  | 'network'
  | 'rate_limited'
  | 'not_found'
  | 'upstream'
  | 'empty'
  | 'parse';

export class MarketDataError extends Error {
  readonly kind: MarketDataErrorKind;

  constructor(kind: MarketDataErrorKind, message: string) {
    super(message);
    this.name = 'MarketDataError';
    this.kind = kind;
  }
}

export function toMarketDataError(err: unknown): MarketDataError {
  return err instanceof MarketDataError
    ? err
    : new MarketDataError('upstream', err instanceof Error ? err.message : 'Unknown error');
}
