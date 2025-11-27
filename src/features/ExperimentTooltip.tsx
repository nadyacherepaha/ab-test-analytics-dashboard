import type { FC } from 'react';
import type { TooltipProps } from 'recharts';
import { format, parseISO } from 'date-fns';

import { CalendarIcon } from '../shared/icons/CalendarIcon';
import { TrophyIcon } from '../shared/icons/TrophyIcon';
import tooltipStyles from './ExperimentTooltip.module.css';
import type { ChartPoint } from './useExperimentChartData';

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

export const ExperimentTooltip: FC<CustomTooltipProps> = (props) => {
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
    const weekRange = point.weekRange || '';
    dateLabel = `${weekRange}`;
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
        <CalendarIcon className={tooltipStyles.calendarIcon} />
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
