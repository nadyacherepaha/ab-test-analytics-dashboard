import styles from './app/App.module.css';
import { ExperimentAnalyticsPage } from './features/ExperimentAnalyticsPage';

function App() {
  return (
    <main className={styles.app}>
      <ExperimentAnalyticsPage />
    </main>
  );
}

export default App;
