import { useState, useEffect, useRef, type FC } from 'react';
import { DropdownArrowIcon } from '../shared/icons/DropdownArrowIcon';
import styles from './VariationsSelector.module.css';

type NormalizedVariation = {
  id?: number;
  name: string;
  key: string;
};

type VariationsSelectorProps = {
  variations: NormalizedVariation[];
  activeKeys: string[];
  onToggle: (next: string[]) => void;
};

export const VariationsSelector: FC<VariationsSelectorProps> = ({
  variations,
  activeKeys,
  onToggle,
}) => {
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

  const handleChange = (key: string) => {
    if (activeKeys.includes(key)) {
      const next = activeKeys.filter((k) => k !== key);
      onToggle(next.length > 0 ? next : activeKeys);
    } else {
      onToggle([...activeKeys, key]);
    }
  };

  const getButtonText = () => {
    if (activeKeys.length === variations.length) {
      return 'All variations selected';
    }
    if (activeKeys.length === 1) {
      const selectedVariation = variations.find((v) => activeKeys.includes(v.key));
      return `${selectedVariation?.name ?? ''} selected`;
    }
    return `${activeKeys.length} variations selected`;
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{getButtonText()}</span>
        <DropdownArrowIcon isOpen={isOpen} className={styles.arrow} />
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          {variations.map((variation) => (
            <label key={variation.key} className={styles.option}>
              <input
                type="checkbox"
                checked={activeKeys.includes(variation.key)}
                onChange={() => handleChange(variation.key)}
              />
              <span>{variation.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
