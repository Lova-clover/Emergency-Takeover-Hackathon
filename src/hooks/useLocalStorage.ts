'use client';
import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      const valueToStore = value instanceof Function ? value(stored) : value;
      setStored(valueToStore);
      try { localStorage.setItem(key, JSON.stringify(valueToStore)); } catch { /* ignore */ }
    },
    [key, stored]
  );

  return [stored, setValue] as const;
}
