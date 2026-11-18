export interface Ticker {
  symbol: string;
  name: string;
  primary?: boolean;
}

// UNH is the primary ticker; up to four peers are compared against it.
export const TICKERS: readonly Ticker[] = [
  { symbol: 'UNH', name: 'UnitedHealth Group', primary: true },
  { symbol: 'ELV', name: 'Elevance Health' },
  { symbol: 'CI', name: 'Cigna' },
  { symbol: 'CVS', name: 'CVS Health' },
  { symbol: 'HUM', name: 'Humana' },
];

// Extra symbols offered as suggestions in the comparison search. They are not part of the
// UNH-vs-peers dashboard; the mock provider also accepts them so the feature works offline.
export const SUGGESTED_SYMBOLS: readonly Ticker[] = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
];
