import { useMemo, type FC } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { format, parseISO } from 'date-fns';

import type { ExperimentData, Variation } from '../shared/types';
import { TrophyIcon } from '../shared/icons/TrophyIcon';
import { CalendarIcon } from '../shared/icons/CalendarIcon';
import styles from './ExperimentChart.module.css';
import tooltipStyles from './ExperimentTooltip.module.css';

type NormalizedVariation = Variation & { key: string };

type ExperimentChartProps = {
  data: ExperimentData;
  normalizedVariations: NormalizedVariation[];
  activeVariationKeys: string[];
  mode: 'day' | 'week';
};

type ChartPoint = {
  date: string;
  weekRange?: string;
  weekLabel?: string;
  monthRange?: string;
  monthLabel?: string;
  [variationKey: string]: string | number | undefined;
};

const BASE_LINE_CONFIG = [
  { name: 'Variation C', color: '#35bdad' },
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
  mode?: 'day' | 'week';
};

const CustomTooltip: FC<CustomTooltipProps> = (props) => {
  const { active, payload, mode = 'day' } = props;
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const rawDate = (payload[0].payload as ChartPoint | undefined)?.date as string | undefined;
  const point = payload[0].payload as ChartPoint | undefined;

  let dateLabel = '';
  if (mode === 'day' && rawDate) {
    try {
      dateLabel = format(parseISO(rawDate), 'dd/MM/yyyy');
    } catch (error) {
      console.error(error);
    }
  }
  if (mode === 'week' && point) {
    const weekLabel = point.weekLabel || '';
    const weekRange = point.weekRange || '';
    dateLabel = `W ${weekLabel} (${weekRange})`;
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

export function ExperimentChart({
  data,
  normalizedVariations,
  activeVariationKeys,
  mode,
}: ExperimentChartProps) {
  const chartData = useMemo<ChartPoint[]>(() => {
    if (mode === 'day') {
      return data.data.map((day) => {
        const point: ChartPoint = {
          date: day.date,
        };

        normalizedVariations.forEach((variation) => {
          const key = variation.key;
          const visits = day.visits[key];
          const conversions = day.conversions[key];

          const rate =
            typeof visits === 'number' && visits > 0 && typeof conversions === 'number'
              ? (conversions / visits) * 100
              : 0;

          point[key] = Number(rate.toFixed(2));
        });

        return point;
      });
    }

    if (mode === 'week') {
      const buckets: Record<
        string,
        {
          visits: Record<string, number>;
          conversions: Record<string, number>;
          startDate: string;
          endDate: string;
        }
      > = {};

      data.data.forEach((day) => {
        const d = parseISO(day.date);
        const weekKey = `${format(d, 'yyyy')}-W${format(d, 'II')}`;

        if (!buckets[weekKey]) {
          buckets[weekKey] = {
            visits: {},
            conversions: {},
            startDate: day.date,
            endDate: day.date,
          };
        }

        buckets[weekKey].endDate = day.date;

        Object.entries(day.visits).forEach(([variationKey, value]) => {
          if (!buckets[weekKey].visits[variationKey]) {
            buckets[weekKey].visits[variationKey] = 0;
          }
          if (typeof value === 'number') {
            buckets[weekKey].visits[variationKey] += value;
          }
        });

        Object.entries(day.conversions).forEach(([variationKey, value]) => {
          if (!buckets[weekKey].conversions[variationKey]) {
            buckets[weekKey].conversions[variationKey] = 0;
          }
          if (typeof value === 'number') {
            buckets[weekKey].conversions[variationKey] += value;
          }
        });
      });

      return Object.entries(buckets).map(([weekKey, bucket]) => {
        const weekNumber = weekKey.split('-W')[1];
        const point: ChartPoint = {
          date: bucket.startDate,
          weekRange: `${format(parseISO(bucket.startDate), 'dd/MM')} - ${format(parseISO(bucket.endDate), 'dd/MM')}`,
          weekLabel: weekNumber,
        };

        normalizedVariations.forEach((variation) => {
          const key = variation.key;
          const visits = bucket.visits[key];
          const conversions = bucket.conversions[key];

          const rate =
            typeof visits === 'number' && visits > 0 && typeof conversions === 'number'
              ? (conversions / visits) * 100
              : 0;

          point[key] = Number(rate.toFixed(2));
        });

        return point;
      });
    }

    const monthBuckets: Record<
      string,
      {
        visits: Record<string, number>;
        conversions: Record<string, number>;
        startDate: string;
        endDate: string;
      }
    > = {};

    data.data.forEach((day) => {
      const d = parseISO(day.date);
      const monthKey = format(d, 'yyyy-MM');

      if (!monthBuckets[monthKey]) {
        monthBuckets[monthKey] = {
          visits: {},
          conversions: {},
          startDate: day.date,
          endDate: day.date,
        };
      }

      monthBuckets[monthKey].endDate = day.date;

      Object.entries(day.visits).forEach(([variationKey, value]) => {
        if (!monthBuckets[monthKey].visits[variationKey]) {
          monthBuckets[monthKey].visits[variationKey] = 0;
        }
        if (typeof value === 'number') {
          monthBuckets[monthKey].visits[variationKey] += value;
        }
      });

      Object.entries(day.conversions).forEach(([variationKey, value]) => {
        if (!monthBuckets[monthKey].conversions[variationKey]) {
          monthBuckets[monthKey].conversions[variationKey] = 0;
        }
        if (typeof value === 'number') {
          monthBuckets[monthKey].conversions[variationKey] += value;
        }
      });
    });

    return Object.entries(monthBuckets).map(([, bucket]) => {
      const point: ChartPoint = {
        date: bucket.startDate,
        monthRange: `${format(parseISO(bucket.startDate), 'dd/MM')} - ${format(parseISO(bucket.endDate), 'dd/MM')}`,
        monthLabel: format(parseISO(bucket.startDate), 'MMM yyyy'),
      };

      normalizedVariations.forEach((variation) => {
        const key = variation.key;
        const visits = bucket.visits[key];
        const conversions = bucket.conversions[key];

        const rate =
          typeof visits === 'number' && visits > 0 && typeof conversions === 'number'
            ? (conversions / visits) * 100
            : 0;

        point[key] = Number(rate.toFixed(2));
      });

      return point;
    });
  }, [data.data, normalizedVariations, mode]);

  const filteredChartData = useMemo(() => {
    return chartData;
  }, [chartData]);

  const yMax = useMemo(() => {
    const values: number[] = [];

    filteredChartData.forEach((point) => {
      activeVariationKeys.forEach((key) => {
        const val = point[key];
        if (typeof val === 'number') {
          values.push(val);
        }
      });
    });

    if (values.length === 0) {
      return 40;
    }

    const rawMax = Math.max(...values);
    const roundedMax = Math.ceil(rawMax / 5) * 5;
    return roundedMax || 5;
  }, [filteredChartData, activeVariationKeys]);

  const monthTicks = useMemo(() => {
    if (!filteredChartData || filteredChartData.length === 0) return [];

    const seen = new Set<string>();
    const ticks: string[] = [];

    filteredChartData.forEach((point) => {
      const hasActiveValue = activeVariationKeys.some((key) => {
        const val = point[key];
        return typeof val === 'number' && val !== 0;
      });

      if (!hasActiveValue) return;

      const rawDate = point.date;
      if (!rawDate) return;

      try {
        const d = parseISO(rawDate);
        const monthKey = format(d, 'yyyy-MM');

        if (!seen.has(monthKey)) {
          seen.add(monthKey);
          ticks.push(rawDate);
        }
      } catch (e) {
        console.log(e);
      }
    });

    return ticks;
  }, [filteredChartData, activeVariationKeys]);

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
        <LineChart data={filteredChartData} margin={{ left: 0, right: 0, top: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e1dfe7" vertical horizontal />

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
            domain={[0, yMax]}
            tickLine={false}
            axisLine={{ stroke: '#e1dfe7' }}
            tick={{ fill: '#918f9a', fontSize: 12 }}
          />

          <Tooltip content={<CustomTooltip mode={mode} />} />

          {normalizedVariations
            .filter((v) => activeVariationKeys.includes(v.key))
            .map((variation) => {
              const config = lineConfig.find((c) => c.key === variation.key);
              const baseConfig = BASE_LINE_CONFIG.find((c) => c.name === variation.name);
              const color = config?.color ?? baseConfig?.color ?? '#000';
              const name = variation.name;

              return (
                <Line
                  key={variation.key}
                  type="monotone"
                  dataKey={variation.key}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  name={name}
                />
              );
            })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
