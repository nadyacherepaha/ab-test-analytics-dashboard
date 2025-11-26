import styles from './ExperimentAnalyticsPage.module.css';
import { ExperimentChart } from './ExperimentChart';
import { useExperimentData } from './useExperimentData';

export function ExperimentAnalyticsPage() {
  const { data, loading, error } = useExperimentData();

  return (
    <div className={styles.container}>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <ExperimentChart data={data} />}
    </div>
  );
}
