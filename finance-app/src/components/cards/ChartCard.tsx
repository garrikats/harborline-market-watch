import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  /** Short right-aligned badge, e.g. a percent change. */
  badge?: ReactNode;
  children: ReactNode;
}

/** Reusable frame for any chart or panel: title, optional subtitle/badge, then content. */
export function ChartCard({ title, subtitle, badge, children }: ChartCardProps) {
  return (
    <section className="chart-card" aria-label={title}>
      <header className="chart-card__header">
        <div>
          <h2 className="chart-card__title">{title}</h2>
          {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
        </div>
        {badge && <div className="chart-card__badge">{badge}</div>}
      </header>
      <div className="chart-card__body">{children}</div>
    </section>
  );
}
