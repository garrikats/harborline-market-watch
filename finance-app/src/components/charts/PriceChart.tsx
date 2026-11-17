import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TimeWindowId } from '../../config/timeWindows';
import type { PricePoint } from '../../services/marketData';
import { formatPrice, formatTime } from '../../utils/format';

interface PriceChartProps {
  points: readonly PricePoint[];
  window: TimeWindowId;
  color?: string;
  height?: number;
}

/** Presentational line chart. Takes data only; never fetches. */
export function PriceChart({ points, window, color = '#0f62fe', height = 220 }: PriceChartProps) {
  return (
    <div role="img" aria-label={`Price chart with ${points.length} data points`}>
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 400, height }}>
        <LineChart data={points as PricePoint[]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="time"
            tickFormatter={(t: number) => formatTime(t, window)}
            minTickGap={40}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => v.toFixed(0)}
            width={44}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            labelFormatter={(t) => formatTime(Number(t), window)}
            formatter={(v) => [formatPrice(Number(v)), 'Close']}
          />
          <Line type="monotone" dataKey="close" stroke={color} dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
