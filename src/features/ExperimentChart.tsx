import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

import type { ExperimentData, Variation } from '../shared/types';
import styles from './ExperimentChart.module.css';

type ExperimentChartProps = {
  data: ExperimentData;
};

type ChartPoint = {
  monthIndex: number;
  monthLabel: string;
  [variationKey: string]: string | number;
};

const BASE_LINE_CONFIG = [
  { name: 'Variation B', color: '#ff8346' },
  { name: 'Variation A', color: '#4142ef' },
  { name: 'Original', color: '#46464f' },
];

const DEFAULT_KEY_BY_NAME: Record<string, string> = {
  'Variation B': '10002',
  'Variation A': '10001',
  Original: '0',
};

export function ExperimentChart({ data }: ExperimentChartProps) {
  const normalizedVariations = useMemo(
    () =>
      data.variations.map((variation) => ({
        ...variation,
        key: String(variation.id ?? 0),
      })),
    [data.variations]
  );

  const chartData = useMemo<ChartPoint[]>(() => {
    const monthlyTotals: Record<
      number,
      { visits: Record<string, number>; conversions: Record<string, number> }
    > = {};

    data.data.forEach((day) => {
      const monthIndex = parseISO(day.date).getMonth() + 1;
      if (!monthlyTotals[monthIndex]) {
        monthlyTotals[monthIndex] = { visits: {}, conversions: {} };
      }

      const bucket = monthlyTotals[monthIndex];

      Object.entries(day.visits).forEach(([variationKey, value]) => {
        if (typeof value === 'number') {
          bucket.visits[variationKey] = (bucket.visits[variationKey] ?? 0) + value;
        }
      });

      Object.entries(day.conversions).forEach(([variationKey, value]) => {
        if (typeof value === 'number') {
          bucket.conversions[variationKey] = (bucket.conversions[variationKey] ?? 0) + value;
        }
      });
    });

    const points: ChartPoint[] = [];

    for (let monthIndex = 1; monthIndex <= 12; monthIndex += 1) {
      const totals = monthlyTotals[monthIndex];
      const point: ChartPoint = {
        monthIndex,
        monthLabel: format(new Date(2000, monthIndex - 1, 1), 'MMM'),
      };

      normalizedVariations.forEach((variation: Variation & { key: string }) => {
        const key = variation.key;
        const visits = totals?.visits[key];
        const conversions = totals?.conversions[key];
        const conversionRate =
          typeof visits === 'number' && visits > 0 && typeof conversions === 'number'
            ? Number(((conversions / visits) * 100).toFixed(2))
            : 0;
        point[key] = conversionRate;
      });

      points.push(point);
    }

    return points;
  }, [data.data, normalizedVariations]);

  const lineConfig = useMemo(
    () =>
      BASE_LINE_CONFIG.map((config) => {
        const variation = normalizedVariations.find((v) => v.name === config.name);
        return {
          ...config,
          key: variation?.key ?? DEFAULT_KEY_BY_NAME[config.name] ?? config.name,
        };
      }),
    [normalizedVariations]
  );

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 16, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="#e1dfe7" vertical horizontal />
          <XAxis
            dataKey="monthLabel"
            tickLine={false}
            axisLine={{ stroke: '#e1dfe7' }}
            tick={{ fill: '#918f9a', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value: number) => `${value}%`}
            domain={[0, 40]}
            ticks={[0, 10, 20, 30, 40]}
            tickLine={false}
            axisLine={{ stroke: '#e1dfe7' }}
            tick={{ fill: '#918f9a', fontSize: 12 }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: 12 }} />
          {lineConfig.map((config) => (
            <Line
              key={config.key}
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              name={config.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
