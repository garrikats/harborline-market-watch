import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TimeWindowId } from '../../config/timeWindows';
import type { ComparisonRow } from '../../utils/compare';
import { formatPercent, formatTime } from '../../utils/format';

interface ComparisonChartProps {
  rows: readonly ComparisonRow[];
  window: TimeWindowId;
  selectedLabel: string;
  baselineLabel: string;
  height?: number;
}

/** Presentational two-line chart of percent change. Takes data only; never fetches. */
export function ComparisonChart({ rows, window, selectedLabel, baselineLabel, height = 260 }: ComparisonChartProps) {
  return (
    <div role="img" aria-label={`Comparison chart of ${selectedLabel} and ${baselineLabel} with ${rows.length} data points`}>
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 400, height }}>
        <LineChart data={rows as ComparisonRow[]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(t: number) => formatTime(t, window)}
            minTickGap={40}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            width={48}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            labelFormatter={(t) => formatTime(Number(t), window)}
            formatter={(v) => formatPercent(Number(v))}
          />
          <Legend />
          <Line type="monotone" dataKey="baseline" name={baselineLabel} stroke="#0f62fe" dot={false} strokeWidth={2} isAnimationActive={false} />
          <Line type="monotone" dataKey="selected" name={selectedLabel} stroke="#da1e28" dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
