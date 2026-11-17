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
