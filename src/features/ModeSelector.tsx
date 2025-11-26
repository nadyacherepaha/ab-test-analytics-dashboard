import { useState, useEffect, useRef, type FC } from 'react';
import { DropdownArrowIcon } from '../shared/icons/DropdownArrowIcon';
import styles from './ModeSelector.module.css';

type Mode = 'day' | 'week';

type ModeSelectorProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

const MODES: { value: Mode; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
];

export const ModeSelector: FC<ModeSelectorProps> = ({ mode, onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (selectedMode: Mode) => {
    onModeChange(selectedMode);
    setIsOpen(false);
  };

  const currentModeLabel = MODES.find((m) => m.value === mode)?.label ?? 'Day';

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentModeLabel}</span>
        <DropdownArrowIcon isOpen={isOpen} className={styles.arrow} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {MODES.map((modeOption) => (
            <button
              key={modeOption.value}
              type="button"
              className={`${styles.option} ${mode === modeOption.value ? styles.active : ''}`}
              onClick={() => handleSelect(modeOption.value)}
            >
              {modeOption.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
