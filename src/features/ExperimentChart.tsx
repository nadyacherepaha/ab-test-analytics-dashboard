import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, parseISO } from 'date-fns';

import type { ExperimentData } from '../shared/types';
import { useExperimentChartData, type NormalizedVariation } from './useExperimentChartData';
import { ExperimentTooltip } from './ExperimentTooltip';
import styles from './ExperimentChart.module.css';

type ExperimentChartProps = {
  data: ExperimentData;
  normalizedVariations: NormalizedVariation[];
  activeVariationKeys: string[];
  mode: 'day' | 'week';
  lineStyle: 'line' | 'smooth' | 'area';
  zoomFactor: number;
  onRegisterExport?: (fn: () => void) => void;
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

export function ExperimentChart({
  data,
  normalizedVariations,
  activeVariationKeys,
  mode,
  lineStyle,
  zoomFactor,
  onRegisterExport,
}: ExperimentChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [themeColors, setThemeColors] = useState({
    axisColor: '#e1dfe7',
    tickColor: '#918f9a',
    gridColor: '#e1dfe7',
  });

  useEffect(() => {
    const updateThemeColors = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      setThemeColors({
        axisColor: computedStyle.getPropertyValue('--chart-axis-color').trim() || '#e1dfe7',
        tickColor: computedStyle.getPropertyValue('--chart-tick-color').trim() || '#918f9a',
        gridColor: computedStyle.getPropertyValue('--chart-grid-color').trim() || '#e1dfe7',
      });
    };

    updateThemeColors();

    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const { zoomedData, yMax, monthTicks } = useExperimentChartData({
    data,
    normalizedVariations,
    activeVariationKeys,
    mode,
    zoomFactor,
  });

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

  const ChartComponent = lineStyle === 'area' ? ComposedChart : LineChart;

  const exportToPng = useCallback(async () => {
    if (!chartRef.current) return;

    const element = chartRef.current;

    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });

    const dataURL = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'experiment-chart.png';
    link.click();
  }, []);

  useEffect(() => {
    if (onRegisterExport) {
      onRegisterExport(exportToPng);
    }
  }, [onRegisterExport, exportToPng]);

  return (
    <div ref={chartRef} className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={320}>
        <ChartComponent data={zoomedData} margin={{ left: 0, right: 0, top: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} vertical horizontal />

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
            axisLine={{ stroke: themeColors.axisColor }}
            tick={{ fill: themeColors.tickColor, fontSize: 12 }}
          />

          <YAxis
            tickFormatter={(value: number) => `${value}%`}
            domain={[0, yMax]}
            tickLine={false}
            axisLine={{ stroke: themeColors.axisColor }}
            tick={{ fill: themeColors.tickColor, fontSize: 12 }}
          />

          <Tooltip content={<ExperimentTooltip mode={mode} />} />

          {normalizedVariations
            .filter((v) => activeVariationKeys.includes(v.key))
            .map((variation) => {
              const config = lineConfig.find((c) => c.key === variation.key);
              const baseConfig = BASE_LINE_CONFIG.find((c) => c.name === variation.name);
              const color = config?.color ?? baseConfig?.color ?? '#000';
              const name = variation.name;

              if (lineStyle === 'area') {
                return (
                  <Area
                    key={variation.key}
                    type="monotone"
                    dataKey={variation.key}
                    stroke={color}
                    fill={color + '66'}
                    strokeWidth={2}
                    dot={false}
                    name={name}
                  />
                );
              }

              return (
                <Line
                  key={variation.key}
                  type={lineStyle === 'smooth' ? 'monotone' : 'linear'}
                  dataKey={variation.key}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  name={name}
                />
              );
            })}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
