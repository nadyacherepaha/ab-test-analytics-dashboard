import { useMemo, type FC } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  type TooltipProps,
} from 'recharts';
import { format, parseISO } from 'date-fns';

import type { ExperimentData, Variation } from '../shared/types';
import { TrophyIcon } from '../shared/icons/TrophyIcon';
import { CalendarIcon } from '../shared/icons/CalendarIcon';
import styles from './ExperimentChart.module.css';
import tooltipStyles from './ExperimentTooltip.module.css';

type ExperimentChartProps = {
  data: ExperimentData;
};

type ChartPoint = {
  date: string;
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

type CustomTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    value?: number;
    dataKey?: string | number;
    name?: string;
    color?: string;
    payload?: ChartPoint;
  }>;
};

const CustomTooltip: FC<CustomTooltipProps> = (props) => {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const rawDate = (payload[0].payload as ChartPoint | undefined)?.date as string | undefined;

  let dateLabel = rawDate;
  if (rawDate) {
    try {
      dateLabel = format(parseISO(rawDate), 'dd/MM/yyyy');
    } catch (error) {
      console.error(error);
    }
  }

  const rows = payload
    .filter((item: { value?: number }) => typeof item.value === 'number')
    .map((item: { value?: number; dataKey?: string | number; name?: string; color?: string }) => ({
      key: String(item.dataKey ?? ''),
      name: String(item.name ?? ''),
      value: Number(item.value ?? 0),
      color: item.color || '#000',
    }))
    .sort((a: { value: number }, b: { value: number }) => b.value - a.value);

  if (rows.length === 0) {
    return null;
  }

  const bestKey = rows[0].key;

  const formatPercent = (value: number) => {
    const fixed = value.toFixed(2);
    return fixed.replace('.', ',') + '%';
  };

  return (
    <div className={tooltipStyles.tooltip}>
      <div className={tooltipStyles.header}>
        <CalendarIcon />
        <span>{dateLabel}</span>
      </div>
      <div className={tooltipStyles.divider} />
      <div className={tooltipStyles.rows}>
        {rows.map((row: { key: string; name: string; value: number; color: string }) => (
          <div key={row.key} className={tooltipStyles.row}>
            <div className={tooltipStyles.rowLeft}>
              <span className={tooltipStyles.dot} style={{ backgroundColor: row.color }} />
              <span className={tooltipStyles.name}>{row.name}</span>
              {row.key === bestKey && (
                <span className={tooltipStyles.trophy}>
                  <TrophyIcon />
                </span>
              )}
            </div>
            <span className={tooltipStyles.value}>{formatPercent(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
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
    return data.data.map((day) => {
      const point: ChartPoint = {
        date: day.date,
      };

      normalizedVariations.forEach((variation: Variation & { key: string }) => {
        const key = variation.key;

        const visits = day.visits[key];
        const conversions = day.conversions[key];

        const conversionRate =
          typeof visits === 'number' && visits > 0 && typeof conversions === 'number'
            ? Number(((conversions / visits) * 100).toFixed(2))
            : 0;

        point[key] = conversionRate;
      });

      return point;
    });
  }, [data.data, normalizedVariations]);

  const monthTicks = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    const seen = new Set<string>();
    const ticks: string[] = [];

    chartData.forEach((point) => {
      const rawDate = point.date;
      if (!rawDate) return;

      try {
        const d = parseISO(rawDate);
        const monthKey = format(d, 'yyyy-MM');

        if (!seen.has(monthKey)) {
          seen.add(monthKey);
          ticks.push(rawDate);
        }
      } catch (error) {
        console.error(error);
      }
    });

    return ticks;
  }, [chartData]);

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
            dataKey="date"
            ticks={monthTicks}
            tickFormatter={(value: string) => {
              try {
                return format(parseISO(value), 'MMM');
              } catch {
                return value;
              }
            }}
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
          <Tooltip content={<CustomTooltip />} />
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
