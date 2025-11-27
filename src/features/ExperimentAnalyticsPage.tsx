import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './ExperimentAnalyticsPage.module.css';
import { ExperimentChart } from './ExperimentChart';
import { VariationsSelector } from './VariationsSelector';
import { ModeSelector } from './ModeSelector';
import { LineStyleSelector } from './LineStyleSelector';
import { ZoomControls } from './ZoomControls';
import { useExperimentData } from './useExperimentData';
import { SunIcon } from '../shared/icons/SunIcon';
import { MoonIcon } from '../shared/icons/MoonIcon';
import { ExportIcon } from '../shared/icons/ExportIcon';

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const chartExportRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    setZoomFactor(1.0);
  }, [resetZoomCounter]);

  const handleZoomIn = () => {
    setZoomFactor((prev) => Math.max(0.1, prev * 0.7));
  };

  const handleZoomOut = () => {
    setZoomFactor((prev) => Math.min(1.0, prev / 0.7));
  };

  const handleExport = () => {
    if (chartExportRef.current) {
      chartExportRef.current();
    }
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
          <div className={styles.topControls}>
            <div className={styles.filters}>
              <VariationsSelector
                variations={normalizedVariations}
                activeKeys={activeVariationKeys}
                onToggle={setActiveVariationKeys}
              />

              <ModeSelector mode={mode} onModeChange={setMode} />
            </div>

            <div className={styles.rightControls}>
              <div className={styles.modeAndStyle}>
                <LineStyleSelector value={lineStyle} onChange={setLineStyle} />

                <button
                  type="button"
                  className={styles.exportButton}
                  onClick={handleExport}
                  aria-label="Export PNG"
                >
                  <ExportIcon />
                </button>

                <ZoomControls
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onReset={() => setResetZoomCounter((x) => x + 1)}
                />
              </div>

              <div className={styles.themeToggle}>
                <button
                  type="button"
                  className={theme === 'light' ? styles.themeButtonActive : styles.themeButton}
                  onClick={() => setTheme('light')}
                  aria-label="Light theme"
                >
                  <SunIcon className={styles.themeIcon} />
                </button>

                <button
                  type="button"
                  className={theme === 'dark' ? styles.themeButtonActive : styles.themeButton}
                  onClick={() => setTheme('dark')}
                  aria-label="Dark theme"
                >
                  <MoonIcon className={styles.themeIcon} />
                </button>
              </div>
            </div>
          </div>

          <ExperimentChart
            data={data}
            normalizedVariations={normalizedVariations}
            activeVariationKeys={activeVariationKeys}
            mode={mode}
            lineStyle={lineStyle}
            zoomFactor={zoomFactor}
            onRegisterExport={(fn) => (chartExportRef.current = fn)}
          />
        </>
      )}
    </div>
  );
}
