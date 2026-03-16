import { type ClassValue, clsx } from 'clsx';

// ─── Classname merge ───
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── Date helpers ───
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function getDDay(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function getDDayLabel(dateStr: string): string {
  const d = getDDay(dateStr);
  if (d > 0) return `D-${d}`;
  if (d === 0) return 'D-Day';
  return `D+${Math.abs(d)}`;
}

export function isPast(dateStr: string): boolean {
  return new Date(dateStr).getTime() < Date.now();
}

export function isFuture(dateStr: string): boolean {
  return new Date(dateStr).getTime() > Date.now();
}

// ─── Status helpers ───
export function getStatusColor(status: string): string {
  switch (status) {
    case 'ongoing':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
    case 'upcoming':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
    case 'ended':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'ongoing': return '진행중';
    case 'upcoming': return '예정';
    case 'ended': return '종료';
    default: return status;
  }
}

export function getStatusDot(status: string): string {
  switch (status) {
    case 'ongoing': return 'bg-emerald-500';
    case 'upcoming': return 'bg-blue-500';
    case 'ended': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
}

// ─── Prize helpers ───
export function formatKRW(amount: number): string {
  if (amount >= 10000) {
    const man = amount / 10000;
    return `${man.toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export function getPrizeLabel(place: string): string {
  switch (place) {
    case '1st': return '🥇 1위';
    case '2nd': return '🥈 2위';
    case '3rd': return '🥉 3위';
    default: return place;
  }
}

export function getPrizeGradient(place: string): string {
  switch (place) {
    case '1st': return 'from-yellow-400 to-amber-500';
    case '2nd': return 'from-slate-300 to-slate-400';
    case '3rd': return 'from-orange-300 to-orange-500';
    default: return 'from-gray-300 to-gray-400';
  }
}

// ─── Milestone helpers ───
export function getMilestoneStatus(at: string): 'past' | 'current' | 'future' {
  const now = Date.now();
  const target = new Date(at).getTime();
  const diff = target - now;
  if (diff < 0) return 'past';
  if (diff < 1000 * 60 * 60 * 24 * 3) return 'current'; // within 3 days
  return 'future';
}

// ─── Score helpers ───
export function formatScore(score: number): string {
  if (score < 1) return score.toFixed(4); // decimal scores like leaderboard
  return score.toFixed(1);
}

// ─── Rank helpers ───
export function getRankEmoji(rank: number): string {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return `${rank}`;
  }
}

export function getRankBg(rank: number): string {
  switch (rank) {
    case 1: return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800';
    case 2: return 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border-slate-200 dark:border-slate-700';
    case 3: return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800';
    default: return 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700';
  }
}
