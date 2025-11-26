export type Variation = {
  id?: number;
  name: string;
};

export type DailyMetrics = {
  date: string;
  visits: Record<string, number>;
  conversions: Record<string, number>;
};

export type ExperimentData = {
  variations: Variation[];
  data: DailyMetrics[];
};

