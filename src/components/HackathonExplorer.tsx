'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpDown,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  Calendar,
  ChevronDown,
  ExternalLink,
  GitCompare,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react';
import { getHackathons } from '@/lib/data-service';
import { isBookmarked, isInCompare, toggleBookmark, toggleCompare } from '@/lib/storage';
import { cn, formatDate, getDDay, getDDayLabel, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import Countdown from '@/components/ui/Countdown';
import EmptyState from '@/components/ui/EmptyState';
import { useHydrated } from '@/hooks/useHydrated';
import type { HackathonListItem } from '@/types';

type SortKey = 'deadline' | 'title' | 'status';
type StatusFilter = 'all' | 'ongoing' | 'upcoming' | 'ended';

interface HackathonExplorerProps {
  featuredSlug?: string;
  compact?: boolean;
}

export default function HackathonExplorer({ featuredSlug, compact = false }: HackathonExplorerProps) {
  const hackathons = getHackathons();
  const { toast } = useToast();
  const hydrated = useHydrated();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('deadline');
  const [, setStorageVersion] = useState(0);

  const filteredAndSorted = useMemo(() => {
    let list = hackathons;
    if (statusFilter !== 'all') {
      list = list.filter((hackathon) => hackathon.status === statusFilter);
    }
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((hackathon) =>
        hackathon.title.toLowerCase().includes(query)
        || hackathon.slug.toLowerCase().includes(query)
        || hackathon.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    const sorted = [...list];
    switch (sortBy) {
      case 'deadline':
        sorted.sort(
          (a, b) =>
            new Date(a.period.submissionDeadlineAt).getTime()
            - new Date(b.period.submissionDeadlineAt).getTime()
        );
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko-KR'));
        break;
      case 'status': {
        const statusOrder = { ongoing: 0, upcoming: 1, ended: 2 };
        sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
      }
    }

    return sorted;
  }, [hackathons, search, sortBy, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { all: hackathons.length, ongoing: 0, upcoming: 0, ended: 0 };
    hackathons.forEach((hackathon) => {
      counts[hackathon.status] += 1;
    });
    return counts;
  }, [hackathons]);

  const handleBookmark = (slug: string, title: string) => {
    const added = toggleBookmark(slug);
    setStorageVersion((value) => value + 1);
    toast(added ? `"${title}" 북마크에 추가했습니다` : `"${title}" 북마크를 해제했습니다`, added ? 'success' : 'info');
  };

  const handleCompare = (slug: string, title: string) => {
    const alreadyIncluded = isInCompare(slug);
    const added = toggleCompare(slug);
    if (!added && !alreadyIncluded) {
      toast('비교함은 최대 3개까지 담을 수 있습니다', 'warning');
      return;
    }
    setStorageVersion((value) => value + 1);
    window.dispatchEvent(new CustomEvent('compare-changed'));
    toast(added ? `"${title}" 비교함에 추가했습니다` : `"${title}" 비교함에서 제거했습니다`, added ? 'success' : 'info');
  };

  return (
    <section className={cn('space-y-6', compact ? 'space-y-5' : 'space-y-7')}>
      <div className="surface-panel overflow-hidden">
        <div className="border-b border-black/6 px-5 py-4 dark:border-white/8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="eyebrow mb-3 inline-flex items-center gap-2">
                <Sparkles size={14} />
                Hackathon Explorer
              </div>
              <h2 className="section-title">기본 명세와 확장 데이터를 함께 보는 해커톤 탐색기</h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted-fg)]">
                제공된 JSON 구조를 유지하면서도 북마크, 비교, 검색, 순위 진입 흐름까지 한 화면에서 이어지도록 구성했습니다.
              </p>
            </div>
            <p className="text-sm text-[var(--muted-fg)]">
              총 <strong className="text-[var(--fg)]">{filteredAndSorted.length}</strong>건            </p>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="해커톤 상태 필터">
            {(['all', 'ongoing', 'upcoming', 'ended'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                role="tab"
                aria-selected={statusFilter === status}
                onClick={() => setStatusFilter(status)}
                className={cn('tab-item', statusFilter === status && 'active')}
              >
                <span>{status === 'all' ? '전체' : getStatusLabel(status)}</span>
                <span className="rounded-full bg-black/6 px-2 py-0.5 text-[11px] dark:bg-white/10">
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="제목, 태그, slug로 검색"
                className="w-full rounded-2xl border border-black/8 bg-white/70 py-3 pl-10 pr-4 text-sm outline-none ring-0 transition focus:border-[var(--primary)] dark:border-white/10 dark:bg-white/5"
                aria-label="해커톤 검색"
              />
            </div>

            <div className="relative w-full lg:w-[180px]">
              <ArrowUpDown
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]"
              />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className="w-full appearance-none rounded-2xl border border-black/8 bg-white/70 py-3 pl-9 pr-9 text-sm outline-none transition focus:border-[var(--primary)] dark:border-white/10 dark:bg-white/5"
                aria-label="정렬 기준"
              >
                <option value="deadline">마감순</option>
                <option value="title">이름순</option>
                <option value="status">상태순</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="조건에 맞는 해커톤이 없습니다"
          description="필터를 초기화하거나 검색어를 조금 넓혀서 보세요."
          action={(
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
              className="focus-ring rounded-full border border-black/10 px-4 py-2 text-sm font-medium"
            >
              필터 초기화            </button>
          )}
        />
      ) : (
        <div className={cn('grid gap-5', compact ? 'lg:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3')}>
          {filteredAndSorted.map((hackathon, index) => (
            <HackathonCard
              key={hackathon.slug}
              featured={hackathon.slug === featuredSlug}
              hackathon={hackathon}
              index={index}
              bookmarked={hydrated ? isBookmarked(hackathon.slug) : false}
              inCompare={hydrated ? isInCompare(hackathon.slug) : false}
              onBookmark={handleBookmark}
              onCompare={handleCompare}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface HackathonCardProps {
  bookmarked: boolean;
  featured: boolean;
  hackathon: HackathonListItem;
  inCompare: boolean;
  index: number;
  onBookmark: (slug: string, title: string) => void;
  onCompare: (slug: string, title: string) => void;
}

function HackathonCard({
  bookmarked,
  featured,
  hackathon,
  inCompare,
  index,
  onBookmark,
  onCompare,
}: HackathonCardProps) {
  const isActive = hackathon.status === 'ongoing' || hackathon.status === 'upcoming';
  const dDay = getDDay(hackathon.period.submissionDeadlineAt);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-[26px] border border-black/8 bg-[var(--card)] p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-black/16 hover:shadow-[0_28px_90px_-44px_rgba(15,23,42,0.45)] dark:border-white/10 dark:hover:border-white/18',
        featured && 'ring-1 ring-[var(--accent)]/35'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-24 opacity-90',
          hackathon.status === 'ongoing' && 'bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.28),transparent_60%)]',
          hackathon.status === 'upcoming' && 'bg-[radial-gradient(circle_at_top_left,rgba(244,162,97,0.28),transparent_60%)]',
          hackathon.status === 'ended' && 'bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.18),transparent_60%)]'
        )}
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('badge', getStatusColor(hackathon.status))}>{getStatusLabel(hackathon.status)}</span>
              <span className="badge bg-black/6 text-[var(--fg)] dark:bg-white/10">
                {isActive ? getDDayLabel(hackathon.period.submissionDeadlineAt) : '아카이브'}
              </span>
              {featured && (
                <span className="badge bg-[var(--accent)]/14 text-[var(--accent)]">
                  추천
                </span>
              )}
            </div>
            <Link href={`/hackathons/${hackathon.slug}`} className="focus-ring block rounded-xl">
              <h3 className="text-xl font-semibold leading-tight tracking-tight text-[var(--fg)] transition group-hover:text-[var(--primary)]">
                {hackathon.title}
              </h3>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onCompare(hackathon.slug, hackathon.title)}
              className={cn(
                'focus-ring rounded-full border p-2 transition',
                inCompare
                  ? 'border-[var(--accent)]/30 bg-[var(--accent)]/12 text-[var(--accent)]'
                  : 'border-black/8 text-[var(--muted-fg)] hover:border-[var(--accent)]/25 hover:text-[var(--accent)] dark:border-white/12'
              )}
              aria-label={inCompare ? '비교에서 제거' : '비교에 추가'}
              title={inCompare ? '비교에서 제거' : '비교에 추가'}
            >
              <GitCompare size={16} />
            </button>
            <button
              onClick={() => onBookmark(hackathon.slug, hackathon.title)}
              className={cn(
                'focus-ring rounded-full border p-2 transition',
                bookmarked
                  ? 'border-[var(--warning)]/35 bg-[var(--warning)]/12 text-[var(--warning)]'
                  : 'border-black/8 text-[var(--muted-fg)] hover:border-[var(--warning)]/25 hover:text-[var(--warning)] dark:border-white/12'
              )}
              aria-label={bookmarked ? '북마크 해제' : '북마크 추가'}
              title={bookmarked ? '북마크 해제' : '북마크 추가'}
            >
              {bookmarked ? <BookmarkCheck size={16} /> : <BookmarkIcon size={16} />}
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {hackathon.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-black/6 px-2.5 py-1 text-[11px] font-medium text-[var(--muted-fg)] dark:bg-white/8"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>

        {isActive && (
          <div className="mb-4 rounded-2xl border border-black/6 bg-white/65 p-3.5 dark:border-white/10 dark:bg-white/4">
            <Countdown targetDate={hackathon.period.submissionDeadlineAt} label="제출 마감까지" compact />
            <div className="mt-2 text-xs text-[var(--muted-fg)]">
              남은 체감 속도: {dDay <= 3 ? '긴급' : dDay <= 10 ? '집중 구간' : '안정적'}
            </div>
          </div>
        )}

        <div className="mb-5 space-y-2 text-sm text-[var(--muted-fg)]">
          <p className="flex items-center gap-2">
            <Calendar size={14} />
            제출 마감 {formatDate(hackathon.period.submissionDeadlineAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-4 text-sm dark:border-white/8">
          <Link href={`/hackathons/${hackathon.slug}`} className="focus-ring rounded-full font-semibold text-[var(--primary)]">
            상세 보기
          </Link>
          <a
            href={hackathon.links.rules}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1 rounded-full text-[var(--muted-fg)] transition hover:text-[var(--fg)]"
          >
            규정
            <ExternalLink size={12} />
          </a>
          <a
            href={hackathon.links.faq}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1 rounded-full text-[var(--muted-fg)] transition hover:text-[var(--fg)]"
          >
            FAQ
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </article>
  );
}
