'use client';
import { useState, useEffect, useCallback } from 'react';

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  label: string;
}

export function useCountdown(targetDate: string): CountdownValues {
  const calc = useCallback((): CountdownValues => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, label: '마감' };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isExpired: false,
      label: '',
    };
  }, [targetDate]);

  const [value, setValue] = useState<CountdownValues>(calc);

  useEffect(() => {
    const timer = setInterval(() => setValue(calc()), 1000);
    return () => clearInterval(timer);
  }, [calc]);

  return value;
}
