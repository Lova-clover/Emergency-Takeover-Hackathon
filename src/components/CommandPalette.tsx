'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowRight, Trophy, Users, Bookmark, BarChart3, Home, GitCompare, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getHackathons } from '@/lib/data-service';
import { getRecentSlugs } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'page' | 'hackathon' | 'recent';
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
}

const staticPages: SearchResult[] = [
  { type: 'page', title: '현황판', description: '애플리케이션 메인 랜딩', url: '/', icon: <Home size={16} /> },
  { type: 'page', title: '해커톤', description: '전체 해커톤 탐색', url: '/hackathons', icon: <Home size={16} /> },
  { type: 'page', title: '순위', description: '공개 순위와 데모 제출', url: '/rankings', icon: <Trophy size={16} /> },
  { type: 'page', title: '캠프', description: '팀 모집과 생성', url: '/camp', icon: <Users size={16} /> },
  { type: 'page', title: '인수인계 감사', description: '구현 범위 확인', url: '/insights', icon: <BarChart3 size={16} /> },
  { type: 'page', title: '북마크', description: '저장한 해커톤', url: '/bookmarks', icon: <Bookmark size={16} /> },
  { type: 'page', title: '비교하기', description: '해커톤 비교', url: '/compare', icon: <GitCompare size={16} /> },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const togglePalette = useCallback((nextOpen?: boolean) => {
    const resolved = nextOpen ?? !open;
    setOpen(resolved);
    if (resolved) {
      setQuery('');
      setSelectedIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === 'Escape') togglePalette(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePalette]);

  const results: SearchResult[] = (() => {
    const q = query.toLowerCase().trim();
    const hackathons = getHackathons();

    if (!q) {
      // Show recent + pages
      const recentSlugs = getRecentSlugs();
      const recentResults: SearchResult[] = recentSlugs.slice(0, 3).map((slug) => {
        const h = hackathons.find((hh) => hh.slug === slug);
        return {
          type: 'recent' as const,
          title: h?.title ?? slug,
          description: '최근 본 해커톤',
          url: `/hackathons/${slug}`,
          icon: <Clock size={16} />,
        };
      });
      return [...recentResults, ...staticPages];
    }

    const hackathonResults: SearchResult[] = hackathons
      .filter((h) => h.title.toLowerCase().includes(q) || h.tags.some((t) => t.toLowerCase().includes(q)))
      .map((h) => ({
        type: 'hackathon' as const,
        title: h.title,
        description: h.tags.join(', '),
        url: `/hackathons/${h.slug}`,
        icon: <Trophy size={16} />,
      }));
    const pageResults = staticPages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
    return [...pageResults, ...hackathonResults].slice(0, 8);
  })();

  const select = useCallback((r: SearchResult) => {
    router.push(r.url);
    setOpen(false);
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, 0)); }
    else if (e.key === 'Enter' && results[selectedIndex]) { select(results[selectedIndex]); }
  };

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] no-print" role="dialog" aria-modal="true" aria-label="검색">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="페이지, 해커톤 검색.."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            aria-label="검색어 입력"
          />
          <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 rounded font-mono">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1" role="listbox">
          {results.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">검색 결과가 없습니다</div>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.type}-${r.url}`}
                role="option"
                aria-selected={i === selectedIndex}
                onClick={() => select(r)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  i === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                )}
              >
                <span className="text-gray-400 shrink-0">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-xs text-gray-400 truncate">{r.description}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 shrink-0" />
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
