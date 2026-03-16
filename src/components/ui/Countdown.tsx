'use client';

import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';

interface CountdownProps {
  targetDate: string;
  label?: string;
  compact?: boolean;
  className?: string;
}

export default function Countdown({ targetDate, label, compact, className }: CountdownProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return (
      <div className={cn('flex items-center gap-1.5 text-sm font-medium text-gray-500', className)}>
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        마감됨
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
          {days > 0 && `${days}일 `}
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        {label && <span className="text-xs text-gray-500">{label}</span>}
      </div>
    );
  }

  return (
    <div className={cn('', className)} aria-label={`마감까지 ${days}일 ${hours}시간 ${minutes}분 ${seconds}초`}>
      {label && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">{label}</p>}
      <div className="flex items-center gap-1.5">
        {days > 0 && (
          <>
            <div className="countdown-digit">{days}</div>
            <span className="text-xs text-gray-400 font-medium">일</span>
          </>
        )}
        <div className="countdown-digit">{String(hours).padStart(2, '0')}</div>
        <span className="text-lg font-bold text-gray-400 animate-pulse">:</span>
        <div className="countdown-digit">{String(minutes).padStart(2, '0')}</div>
        <span className="text-lg font-bold text-gray-400 animate-pulse">:</span>
        <div className="countdown-digit">{String(seconds).padStart(2, '0')}</div>
      </div>
    </div>
  );
}
