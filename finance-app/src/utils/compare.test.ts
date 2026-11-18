import { describe, expect, it } from 'vitest';
import { buildComparisonRows } from './compare';

describe('buildComparisonRows', () => {
  it('rebases both series to percent change from their first point', () => {
    const rows = buildComparisonRows(
      [{ time: 1, close: 50 }, { time: 2, close: 55 }],
      [{ time: 1, close: 200 }, { time: 2, close: 190 }],
    );
    expect(rows).toEqual([
      { time: 1, selected: 0, baseline: 0 },
      { time: 2, selected: expect.closeTo(10), baseline: expect.closeTo(-5) },
    ]);
  });

  it('carries the latest baseline point forward when timestamps differ', () => {
    const rows = buildComparisonRows(
      [{ time: 10, close: 1 }, { time: 25, close: 2 }],
      [{ time: 9, close: 100 }, { time: 20, close: 110 }],
    );
    expect(rows.map((r) => r.baseline)).toEqual([0, expect.closeTo(10)]);
  });

  it('leaves the baseline null before its first point or when it is empty', () => {
    expect(buildComparisonRows([{ time: 1, close: 1 }], [{ time: 5, close: 10 }])[0].baseline).toBeNull();
    expect(buildComparisonRows([{ time: 1, close: 1 }], [])[0].baseline).toBeNull();
  });

  it('returns no rows for an empty selected series', () => {
    expect(buildComparisonRows([], [{ time: 1, close: 1 }])).toEqual([]);
  });
});
