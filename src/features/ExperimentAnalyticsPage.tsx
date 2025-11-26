import { useState, useMemo, useEffect } from 'react';
import styles from './ExperimentAnalyticsPage.module.css';
import { ExperimentChart } from './ExperimentChart';
import { VariationsSelector } from './VariationsSelector';
import { useExperimentData } from './useExperimentData';

export function ExperimentAnalyticsPage() {
  const { data, loading, error } = useExperimentData();

  const normalizedVariations = useMemo(
    () =>
      data?.variations.map((v) => ({
        ...v,
        key: String(v.id ?? 0),
      })) ?? [],
    [data?.variations]
  );

  const [activeVariationKeys, setActiveVariationKeys] = useState<string[]>([]);

  useEffect(() => {
    if (normalizedVariations.length > 0) {
      const allKeys = normalizedVariations.map((v) => v.key);
      
      setActiveVariationKeys((prev) => {
        if (prev.length === 0 || !prev.some((k) => allKeys.includes(k))) {
          return allKeys;
        }
        return prev;
      });
    }
  }, [normalizedVariations]);

  if (!data) {
    return (
      <div className={styles.container}>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && (
        <>
          <VariationsSelector
            variations={normalizedVariations}
            activeKeys={activeVariationKeys}
            onToggle={setActiveVariationKeys}
          />
          <ExperimentChart
            data={data}
            normalizedVariations={normalizedVariations}
            activeVariationKeys={activeVariationKeys}
          />
        </>
      )}
    </div>
  );
}
