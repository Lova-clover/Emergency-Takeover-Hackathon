'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Eye, Users, FileText, ChevronDown, Star, StarOff, Clock, Zap } from 'lucide-react';
import hackathonsData from '@/data/hackathons.json';
import { Hackathon } from '@/types';
import { getStatusColor, getStatusLabel, getDaysLeft, cn } from '@/lib/utils';
import { isBookmarked, addBookmark, removeBookmark } from '@/lib/storage';
import { useToast } from '@/components/Toast';

const hackathons = hackathonsData as Hackathon[];

type StatusFilter = 'all' | 'ongoing' | 'upcoming' | 'ended';
type SortOption = 'latest' | 'popular' | 'participants' | 'deadline';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [bookmarksSet, setBookmarksSet] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  useEffect(() => {
    const bm = new Set<string>();
    hackathons.forEach((h) => { if (isBookmarked(h.slug)) bm.add(h.slug); });
    setBookmarksSet(bm);
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    hackathons.forEach((h) => h.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, []);

  const filtered = useMemo(() => {
    let result = [...hackathons];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((h) =>
        h.title.toLowerCase().includes(q) ||
        h.overview.summary.toLowerCase().includes(q) ||
        h.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') result = result.filter((h) => h.status === statusFilter);
    if (tagFilter) result = result.filter((h) => h.tags.includes(tagFilter));

    switch (sortBy) {
      case 'popular': result.sort((a, b) => b.views - a.views); break;
      case 'participants': result.sort((a, b) => b.participantCount - a.participantCount); break;
      case 'deadline': result.sort((a, b) => new Date(a.period.registrationDeadline).getTime() - new Date(b.period.registrationDeadline).getTime()); break;
      default: result.sort((a, b) => new Date(b.period.competitionStart).getTime() - new Date(a.period.competitionStart).getTime());
    }
    return result;
  }, [search, statusFilter, tagFilter, sortBy]);

  const handleBookmark = (slug: string) => {
    const next = new Set(bookmarksSet);
    if (next.has(slug)) { removeBookmark(slug); next.delete(slug); addToast('북마크가 해제되었습니다', 'info'); }
    else { addBookmark(slug); next.add(slug); addToast('북마크에 저장되었습니다', 'success'); }
    setBookmarksSet(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-10 animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 md:p-12 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={20} className="text-yellow-300" />
              <span className="text-sm font-medium text-blue-200">AI 서비스개발 히어로의 여정</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">해커톤에 참여하세요</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              데이터 경진대회와 해커톤에서 팀을 구성하고, 함께 도전하세요. 바이브 코딩으로 새로운 서비스를 만들어 보세요!
            </p>
            <div className="flex items-center gap-4 mt-6 text-sm text-blue-200">
              <span className="flex items-center gap-1"><Users size={14} /> {hackathons.reduce((s, h) => s + h.participantCount, 0)}+ 참가자</span>
              <span className="flex items-center gap-1"><FileText size={14} /> {hackathons.length}개 대회</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4 animate-slide-up">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="해커톤 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm cursor-pointer outline-none">
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="participants">참가자순</option>
              <option value="deadline">마감임박순</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={16} className="text-gray-400" />
          {(['all', 'ongoing', 'upcoming', 'ended'] as StatusFilter[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1 rounded-full text-sm font-medium transition-all',
                statusFilter === s ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600')}>
              {s === 'all' ? '전체' : getStatusLabel(s)}
            </button>
          ))}
          <span className="text-gray-300 dark:text-gray-600">|</span>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
              className={cn('px-3 py-1 rounded-full text-sm transition-all',
                tagFilter === tag ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-400 dark:hover:bg-slate-600')}>
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">{filtered.length}개의 해커톤</div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">검색 결과가 없습니다</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">다른 검색어나 필터를 시도해 보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((h, idx) => (
            <div key={h.slug} className="card-hover bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(h.status))}>{getStatusLabel(h.status)}</span>
                  <button onClick={() => handleBookmark(h.slug)} className="text-gray-400 hover:text-yellow-500 transition-colors">
                    {bookmarksSet.has(h.slug) ? <Star size={18} className="text-yellow-500 fill-yellow-500" /> : <StarOff size={18} />}
                  </button>
                </div>
                <Link href={`/hackathons/${h.slug}`}>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">{h.title}</h3>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{h.overview.summary}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {h.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-md font-medium">{tag}</span>
                  ))}
                </div>
                {h.status === 'ongoing' && (
                  <div className="flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400 mb-3 font-medium">
                    <Clock size={14} /><span>{getDaysLeft(h.period.registrationDeadline)}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <span className="flex items-center gap-1"><Eye size={12} /> {h.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {h.participantCount}</span>
                  <span className="flex items-center gap-1"><FileText size={12} /> {h.submissionCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
