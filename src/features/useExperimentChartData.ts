import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';

import type { ExperimentData, Variation } from '../shared/types';

export type NormalizedVariation = Variation & { key: string };

export type ChartPoint = {
  date: string;
  weekRange?: string;
  monthRange?: string;
  monthLabel?: string;
  [variationKey: string]: string | number | undefined;
};

type UseExperimentChartDataArgs = {
  data: ExperimentData;
  normalizedVariations: NormalizedVariation[];
  activeVariationKeys: string[];
  mode: 'day' | 'week';
  zoomFactor: number;
};

export const useExperimentChartData = ({
  data,
  normalizedVariations,
  activeVariationKeys,
  mode,
  zoomFactor,
}: UseExperimentChartDataArgs) => {
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

      return Object.entries(buckets).map(([, bucket]) => {
        const point: ChartPoint = {
          date: bucket.startDate,
          weekRange: `${format(parseISO(bucket.startDate), 'dd/MM/yyyy')} - ${format(parseISO(bucket.endDate), 'dd/MM/yyyy')}`,
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

  const zoomedData = useMemo(() => {
    if (zoomFactor >= 1.0 || filteredChartData.length === 0) {
      return filteredChartData;
    }

    const totalPoints = filteredChartData.length;
    const visibleCount = Math.max(1, Math.floor(totalPoints * zoomFactor));

    const center = Math.floor(totalPoints / 2);
    const halfCount = Math.floor(visibleCount / 2);
    let startIndex = Math.max(0, center - halfCount);
    const endIndex = Math.min(totalPoints - 1, startIndex + visibleCount - 1);

    if (endIndex === totalPoints - 1) {
      startIndex = Math.max(0, endIndex - visibleCount + 1);
    }

    return filteredChartData.slice(startIndex, endIndex + 1);
  }, [filteredChartData, zoomFactor]);

  const yMax = useMemo(() => {
    const values: number[] = [];

    zoomedData.forEach((point) => {
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
  }, [zoomedData, activeVariationKeys]);

  const monthTicks = useMemo(() => {
    if (!zoomedData || zoomedData.length === 0) return [];

    const seen = new Set<string>();
    const ticks: string[] = [];

    zoomedData.forEach((point) => {
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
  }, [zoomedData, activeVariationKeys]);

  return {
    chartData,
    zoomedData,
    yMax,
    monthTicks,
  };
};
