import { useMemo } from 'react';
import type { TimeWindowId } from '../../config/timeWindows';
import { useSeries } from '../../hooks/useSeries';
import type { MarketDataError } from '../../services/marketData';
import { buildComparisonRows } from '../../utils/compare';
import { formatPercent, percentChange } from '../../utils/format';
import { ChartCard } from '../cards/ChartCard';
import { ComparisonChart } from '../charts/ComparisonChart';

const BASELINE_SYMBOL = 'UNH';

interface ComparisonCardProps {
  symbol: string;
  window: TimeWindowId;
}

function describeError(symbol: string, error: MarketDataError): string {
  switch (error.kind) {
    case 'not_found':
    case 'empty':
      return `No data available for ${symbol}. Check the symbol and try again.`;
    case 'rate_limited':
      return `Too many requests while loading ${symbol}. Please wait a moment and try again.`;
    case 'network':
      return `Could not reach the market data service for ${symbol}. Check your connection and try again.`;
    default:
      return `Could not load ${symbol}: ${error.message}`;
  }
}

/** Compares the user-selected symbol with UNH. Owns its own loading and error state. */
export function ComparisonCard({ symbol, window }: ComparisonCardProps) {
  const selected = useSeries(symbol, window);
  const baseline = useSeries(BASELINE_SYMBOL, window);
  const title = `${symbol} vs. ${BASELINE_SYMBOL}`;

  const selectedPoints = selected.status === 'success' ? selected.series.points : null;
  const baselinePoints = baseline.status === 'success' ? baseline.series.points : null;
  const rows = useMemo(
    () => (selectedPoints ? buildComparisonRows(selectedPoints, baselinePoints ?? []) : []),
    [selectedPoints, baselinePoints],
  );

  // Never substitute another company's data: if the selected symbol has no series, show only the message.
  if (selected.status === 'error') {
    return (
      <ChartCard title={title}>
        <p role="alert" className="error" data-kind={selected.error.kind}>
          {describeError(symbol, selected.error)}
        </p>
      </ChartCard>
    );
  }

  if (!selectedPoints || baseline.status === 'loading') {
    return (
      <ChartCard title={title}>
        <p role="status" className="muted">Loading…</p>
      </ChartCard>
    );
  }

  const change = percentChange(selectedPoints);
  return (
    <ChartCard
      title={title}
      subtitle="Percent change over the selected window"
      badge={
        <span className={change >= 0 ? 'up' : 'down'} data-testid={`comparison-change-${symbol}`}>
          {symbol} {formatPercent(change)}
        </span>
      }
    >
      <ComparisonChart rows={rows} window={window} selectedLabel={symbol} baselineLabel={BASELINE_SYMBOL} />
      {baseline.status === 'error' && (
        <p role="status" className="muted">{BASELINE_SYMBOL} data is unavailable, so only {symbol} is shown.</p>
      )}
    </ChartCard>
  );
}
