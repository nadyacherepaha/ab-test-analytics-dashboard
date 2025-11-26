import styles from './ExperimentAnalyticsPage.module.css';
import { useExperimentData } from './useExperimentData';

export function ExperimentAnalyticsPage() {
  const { data, loading, error } = useExperimentData();

  return (
    <div className={styles.container}>
      <h2>Experiment Analytics</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && (
        <div className={styles.stats}>
          <p>Variations: {data.variations.length}</p>
          <p>Days: {data.data.length}</p>
        </div>
      )}
    </div>
  );
}

