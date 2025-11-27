import { useState, useEffect, useRef, type FC } from 'react';
import { DropdownArrowIcon } from '../shared/icons/DropdownArrowIcon';
import styles from './LineStyleSelector.module.css';

type LineStyle = 'line' | 'smooth' | 'area';

type LineStyleSelectorProps = {
  value: LineStyle;
  onChange: (v: LineStyle) => void;
};

const LINE_STYLES: { value: LineStyle; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'area', label: 'Area' },
];

export const LineStyleSelector: FC<LineStyleSelectorProps> = ({ value, onChange }) => {
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

  const handleSelect = (selectedStyle: LineStyle) => {
    onChange(selectedStyle);
    setIsOpen(false);
  };

  const currentStyleLabel = LINE_STYLES.find((s) => s.value === value)?.label ?? 'Line';

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>Line style: {currentStyleLabel}</span>

        <DropdownArrowIcon isOpen={isOpen} className={styles.arrow} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {LINE_STYLES.map((styleOption) => (
            <button
              key={styleOption.value}
              type="button"
              className={`${styles.option} ${value === styleOption.value ? styles.active : ''}`}
              onClick={() => handleSelect(styleOption.value)}
            >
              {styleOption.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
