import { useState, useMemo, useEffect } from 'react';
import styles from './ExperimentAnalyticsPage.module.css';
import { ExperimentChart } from './ExperimentChart';
import { VariationsSelector } from './VariationsSelector';
import { ModeSelector } from './ModeSelector';
import { LineStyleSelector } from './LineStyleSelector';
import { ZoomControls } from './ZoomControls';
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
  const [mode, setMode] = useState<'day' | 'week'>('day');
  const [lineStyle, setLineStyle] = useState<'line' | 'smooth' | 'area'>('smooth');
  const [resetZoomCounter, setResetZoomCounter] = useState(0);
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);

  useEffect(() => {
    setZoomFactor(1.0);
  }, [resetZoomCounter]);

  const handleZoomIn = () => {
    setZoomFactor((prev) => Math.max(0.1, prev * 0.7));
  };

  const handleZoomOut = () => {
    setZoomFactor((prev) => Math.min(1.0, prev / 0.7));
  };

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
          <div className={styles.features}>
            <div className={styles.filters}>
              <VariationsSelector
                variations={normalizedVariations}
                activeKeys={activeVariationKeys}
                onToggle={setActiveVariationKeys}
              />

              <ModeSelector mode={mode} onModeChange={setMode} />
            </div>

            <div className={styles.rightControls}>
              <LineStyleSelector value={lineStyle} onChange={setLineStyle} />

              <ZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={() => setResetZoomCounter((x) => x + 1)}
              />
            </div>
          </div>

          <ExperimentChart
            data={data}
            normalizedVariations={normalizedVariations}
            activeVariationKeys={activeVariationKeys}
            mode={mode}
            lineStyle={lineStyle}
            zoomFactor={zoomFactor}
          />
        </>
      )}
    </div>
  );
}
