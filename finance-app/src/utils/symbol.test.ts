import { describe, expect, it } from 'vitest';
import { normalizeSymbol } from './symbol';

describe('normalizeSymbol', () => {
  it('trims and upper-cases', () => {
    expect(normalizeSymbol('  aapl ')).toBe('AAPL');
  });

  it('accepts common ticker punctuation', () => {
    expect(normalizeSymbol('brk-b')).toBe('BRK-B');
    expect(normalizeSymbol('^gspc')).toBe('^GSPC');
  });

  it.each(['', '   ', 'AA PL', 'A/B', '../etc', 'TOOLONGSYMBOL1', 'a?b=c'])('rejects %j', (input) => {
    expect(normalizeSymbol(input)).toBeNull();
  });
});
