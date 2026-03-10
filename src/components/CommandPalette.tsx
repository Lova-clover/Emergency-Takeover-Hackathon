'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ArrowRight, Trophy, Users, Bookmark, BarChart3, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import hackathonsData from '@/data/hackathons.json';
import { Hackathon } from '@/types';
import { cn } from '@/lib/utils';

const hackathons = hackathonsData as Hackathon[];

interface SearchResult {
  type: 'hackathon' | 'page';
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
}

const staticPages: SearchResult[] = [
  { type: 'page', title: '홈', description: '해커톤 목록 확인', url: '/', icon: <Home size={16} /> },
  { type: 'page', title: '리더보드', description: '팀 순위 확인', url: '/leaderboard', icon: <Trophy size={16} /> },
  { type: 'page', title: '팀 모집', description: '팀원 모집 현황', url: '/teams', icon: <Users size={16} /> },
  { type: 'page', title: '북마크', description: '저장한 해커톤', url: '/bookmarks', icon: <Bookmark size={16} /> },
  { type: 'page', title: '인사이트', description: '데이터 분석 대시보드', url: '/insights', icon: <BarChart3 size={16} /> },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const results: SearchResult[] = (() => {
    const q = query.toLowerCase().trim();
    const hackathonResults: SearchResult[] = hackathons
      .filter((h) => h.title.toLowerCase().includes(q) || h.tags.some((t) => t.toLowerCase().includes(q)) || h.overview.summary.toLowerCase().includes(q))
      .map((h) => ({
        type: 'hackathon' as const,
        title: h.title,
        description: h.overview.summary.slice(0, 60) + '…',
        url: `/hackathons/${h.slug}`,
        icon: <Trophy size={16} />,
      }));
    const pageResults = staticPages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
    return [...pageResults, ...hackathonResults].slice(0, 8);
  })();

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      router.push(result.url);
      setOpen(false);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-fade-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <Search size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="페이지 또는 해커톤 검색..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 rounded font-mono">ESC</kbd>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 sm:hidden">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[320px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">검색 결과가 없습니다</div>
          ) : (
            results.map((result, i) => (
              <button
                key={`${result.type}-${result.url}`}
                onClick={() => handleSelect(result)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  i === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                )}
              >
                <span className="text-gray-400">{result.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  <p className="text-xs text-gray-400 truncate">{result.description}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700 text-[11px] text-gray-400 flex items-center gap-4">
          <span>↑↓ 이동</span>
          <span>↵ 선택</span>
          <span>ESC 닫기</span>
        </div>
      </div>
    </div>
  );
}
