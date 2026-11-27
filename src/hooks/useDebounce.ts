'use client';

import { useEffect, useState } from 'react';

/**
 * Debounces rapidly changing values (default 800ms).
 * When cleared back to an empty string, updates immediately for snappy clear UX.
 */
export function useDebounce<T>(value: T, delay = 800): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    if (typeof value === 'string' && value.trim() === '') {
      setDebouncedValue(value);
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
