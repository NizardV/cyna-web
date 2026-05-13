import { useState, useEffect } from 'react';

/**
 * A simple React hook for debouncing values
 * @param value The value to debounce
 * @param delay Debounce delay in milliseconds
 * @returns The debounced value
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