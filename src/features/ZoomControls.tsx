import type { FC } from 'react';
import { ResetIcon } from '../shared/icons/ResetIcon';
import styles from './ZoomControls.module.css';

type ZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export const ZoomControls: FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <button type="button" className={styles.button} onClick={onZoomOut} aria-label="Zoom out">
          <span className={styles.minus}>−</span>
        </button>
        <button type="button" className={styles.button} onClick={onZoomIn} aria-label="Zoom in">
          <span className={styles.plus}>+</span>
        </button>
      </div>
      <button
        type="button"
        className={styles.resetButton}
        onClick={onReset}
        aria-label="Reset zoom"
      >
        <ResetIcon className={styles.resetIcon} />
      </button>
    </div>
  );
};
