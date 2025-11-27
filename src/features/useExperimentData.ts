import { useEffect, useState } from 'react';
import type { ExperimentData } from '../shared/types';

type UseExperimentDataResult = {
  data: ExperimentData | null;
  loading: boolean;
  error: string | null;
};

export function useExperimentData(): UseExperimentDataResult {
  const [data, setData] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataUrl = `${import.meta.env.BASE_URL}data/data.json`;
        const response = await fetch(dataUrl);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as ExperimentData;

        setData(payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
          setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
