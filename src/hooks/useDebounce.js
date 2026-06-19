import { useState, useEffect } from 'react';

/**
 * Retarde la mise à jour d'une valeur jusqu'à ce que `delay` ms se soient
 * écoulées sans nouveau changement. Utile pour différer les appels API
 * déclenchés par la saisie utilisateur.
 *
 * @template T
 * @param {T} value - Valeur à debouncer
 * @param {number} delay - Délai en millisecondes
 * @returns {T} Valeur debouncée
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}