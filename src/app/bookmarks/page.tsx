'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark as BookmarkIcon, Trash2, Clock } from 'lucide-react';
import { getBookmarks, removeBookmark } from '@/lib/storage';
import { getHackathonTitle, getHackathons } from '@/lib/data-service';
import { cn, formatDate } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import EmptyState from '@/components/ui/EmptyState';
import { useHydrated } from '@/hooks/useHydrated';

export default function BookmarksPage() {
  const { toast } = useToast();
  const hydrated = useHydrated();
  const [, setVersion] = useState(0);
  const hackathons = getHackathons();
  const bookmarks = hydrated ? getBookmarks() : [];

  const handleRemove = (slug: string) => {
    removeBookmark(slug);
    setVersion((value) => value + 1);
    toast('북마크에서 제거했습니다', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <section className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <BookmarkIcon size={28} className="text-amber-500" />
          <h1 className="text-3xl font-extrabold tracking-tight">북마크</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">관심 있는 해커톤을 저장하고 관리하세요.</p>
      </section>

      {bookmarks.length === 0 ? (
        <EmptyState
          emoji="📭"
          title="저장된 북마크가 없습니다"
          description="해커톤 목록에서 관심 있는 행사를 북마크하세요."
          action={<Link href="/" className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus-ring">해커톤 목록 보기</Link>}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">총 <strong className="text-gray-900 dark:text-gray-100">{bookmarks.length}</strong>개의 북마크</p>
          <div className="space-y-3">
            {bookmarks.map((b, i) => {
              const h = hackathons.find((h) => h.slug === b.slug);
              const title = h?.title ?? getHackathonTitle(b.slug);
              return (
                <div key={b.slug}
                  className="flex items-center justify-between p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 hover:border-amber-300 dark:hover:border-amber-700 transition-colors animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="min-w-0 flex-1">
                    <Link href={`/hackathons/${b.slug}`} className="font-bold text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-ring rounded">
                      {title}
                    </Link>
                    {h && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={cn('badge text-[10px]',
                          h.status === 'ongoing' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          h.status === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-500'
                        )}>
                          {h.status === 'ongoing' ? '진행중' : h.status === 'upcoming' ? '예정' : '종료'}
                        </span>
                        {h.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[11px] text-gray-400">{t}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={10} /> 북마크 추가: {formatDate(b.addedAt)}</p>
                  </div>
                  <button onClick={() => handleRemove(b.slug)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-ring"
                    aria-label={`${title} 북마크 제거`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
