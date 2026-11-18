import { useState } from 'react';
import { ComparisonCard } from '../components/cards/ComparisonCard';
import { TickerCard } from '../components/cards/TickerCard';
import { SymbolSearch } from '../components/controls/SymbolSearch';
import { TimeWindowTabs } from '../components/controls/TimeWindowTabs';
import { TICKERS } from '../config/tickers';
import { DEFAULT_WINDOW, getTimeWindow, type TimeWindowId } from '../config/timeWindows';

export function DashboardPage() {
  const [window, setWindow] = useState<TimeWindowId>(DEFAULT_WINDOW);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <h1>Harborline Market Watch</h1>
        <p className="muted">
          UnitedHealth Group vs. health-insurer peers · {getTimeWindow(window).label} · delayed, informational data
        </p>
        <TimeWindowTabs value={window} onChange={setWindow} />
      </header>
      <div className="dashboard__grid">
        {TICKERS.map((ticker) => (
          <TickerCard key={ticker.symbol} ticker={ticker} window={window} />
        ))}
      </div>
      <div className="dashboard__compare">
        <SymbolSearch onSubmit={setSelectedSymbol} />
        {selectedSymbol && <ComparisonCard symbol={selectedSymbol} window={window} />}
      </div>
    </main>
  );
}
