import { clsx } from 'clsx';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'ongoing':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'upcoming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'ended':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'ongoing': return '진행중';
    case 'upcoming': return '예정';
    case 'ended': return '종료';
    default: return status;
  }
}

export function getBadgeColor(badge: string) {
  switch (badge) {
    case 'Grandmaster': return 'text-yellow-500';
    case 'Master': return 'text-purple-500';
    case 'Diamond': return 'text-cyan-400';
    case 'Platinum': return 'text-emerald-400';
    case 'Gold': return 'text-amber-400';
    default: return 'text-gray-400';
  }
}

export function formatDate(isoString: string) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getDaysLeft(deadline: string): string {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return '마감';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `D-${days}`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}시간 남음`;
}
