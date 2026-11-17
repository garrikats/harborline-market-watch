import type { Ticker } from '../../config/tickers';
import type { TimeWindowId } from '../../config/timeWindows';
import { useSeries } from '../../hooks/useSeries';
import { formatPercent, formatPrice, percentChange } from '../../utils/format';
import { ChartCard } from '../cards/ChartCard';
import { PriceChart } from '../charts/PriceChart';

interface TickerCardProps {
  ticker: Ticker;
  window: TimeWindowId;
}

/** One ticker's chart card. Owns its own loading and error state. */
export function TickerCard({ ticker, window }: TickerCardProps) {
  const state = useSeries(ticker.symbol, window);
  const title = `${ticker.symbol} · ${ticker.name}`;

  if (state.status === 'loading') {
    return (
      <ChartCard title={title}>
        <p role="status" className="muted">Loading…</p>
      </ChartCard>
    );
  }

  if (state.status === 'error') {
    return (
      <ChartCard title={title}>
        <p role="alert" className="error" data-kind={state.error.kind}>
          Could not load {ticker.symbol}: {state.error.message}
        </p>
      </ChartCard>
    );
  }

  const { points } = state.series;
  const change = percentChange(points);
  const last = points[points.length - 1].close;
  return (
    <ChartCard
      title={title}
      subtitle={formatPrice(last)}
      badge={
        <span className={change >= 0 ? 'up' : 'down'} data-testid={`change-${ticker.symbol}`}>
          {formatPercent(change)}
        </span>
      }
    >
      <PriceChart points={points} window={window} color={ticker.primary ? '#0f62fe' : '#6f6f6f'} />
    </ChartCard>
  );
}
