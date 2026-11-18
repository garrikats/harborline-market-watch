// Letters, digits and the punctuation real tickers use (BRK-B, BF.B, ^GSPC). Max 12 chars.
const SYMBOL_PATTERN = /^[A-Z0-9.^=-]{1,12}$/;

/** Trims and upper-cases user input. Returns null when it is not a plausible ticker. */
export function normalizeSymbol(input: string): string | null {
  const symbol = input.trim().toUpperCase();
  return SYMBOL_PATTERN.test(symbol) ? symbol : null;
}
