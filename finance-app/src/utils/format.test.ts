import { describe, expect, it } from 'vitest';
import { formatPercent, percentChange } from './format';

describe('percentChange', () => {
  it('computes first-to-last change', () => {
    expect(percentChange([{ time: 1, close: 100 }, { time: 2, close: 110 }])).toBeCloseTo(10);
  });

  it('returns 0 for fewer than two points', () => {
    expect(percentChange([])).toBe(0);
    expect(percentChange([{ time: 1, close: 5 }])).toBe(0);
  });
});

describe('formatPercent', () => {
  it('adds a plus sign only to positive values', () => {
    expect(formatPercent(1.234)).toBe('+1.23%');
    expect(formatPercent(-2)).toBe('-2.00%');
    expect(formatPercent(0)).toBe('0.00%');
  });
});
