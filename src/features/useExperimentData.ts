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
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        const response = await fetch('/data/data.json');

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as ExperimentData;

        if (isSubscribed) {
          setData(payload);
        }
      } catch (err) {
        if (!isSubscribed) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  return { data, loading, error };
}

