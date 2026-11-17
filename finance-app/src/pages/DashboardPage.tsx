import { useState } from 'react';
import { TickerCard } from '../components/cards/TickerCard';
import { TimeWindowTabs } from '../components/controls/TimeWindowTabs';
import { TICKERS } from '../config/tickers';
import { DEFAULT_WINDOW, getTimeWindow, type TimeWindowId } from '../config/timeWindows';

export function DashboardPage() {
  const [window, setWindow] = useState<TimeWindowId>(DEFAULT_WINDOW);

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
    </main>
  );
}
