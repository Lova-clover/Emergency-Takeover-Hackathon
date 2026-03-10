'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Star, Trash2, ExternalLink, Clock } from 'lucide-react';
import hackathonsData from '@/data/hackathons.json';
import { Hackathon, Bookmark as BookmarkType } from '@/types';
import { getBookmarks, removeBookmark } from '@/lib/storage';
import { getStatusColor, getStatusLabel, getDaysLeft, cn } from '@/lib/utils';

const hackathons = hackathonsData as Hackathon[];

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const bookmarkedHackathons = bookmarks
    .map((b) => ({
      ...b,
      hackathon: hackathons.find((h) => h.slug === b.slug),
    }))
    .filter((b) => b.hackathon)
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  const handleRemove = (slug: string) => {
    removeBookmark(slug);
    setBookmarks(getBookmarks());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Bookmark className="text-yellow-500" size={32} />
          북마크
        </h1>
        <p className="text-gray-500 dark:text-gray-400">저장한 해커톤 목록입니다</p>
      </div>

      {bookmarkedHackathons.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">저장한 해커톤이 없습니다</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">관심 있는 해커톤의 별 아이콘을 눌러 저장하세요</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            해커톤 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedHackathons.map((item) => {
            const h = item.hackathon!;
            return (
              <div key={h.slug} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 card-hover animate-slide-up">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(h.status))}>
                        {getStatusLabel(h.status)}
                      </span>
                      {h.status === 'ongoing' && (
                        <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                          <Clock size={12} /> {getDaysLeft(h.period.registrationDeadline)}
                        </span>
                      )}
                    </div>
                    <Link href={`/hackathons/${h.slug}`}>
                      <h3 className="font-bold text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer mb-1">{h.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{h.overview.summary}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {h.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-md font-medium">{tag}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">저장일: {new Date(item.addedAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/hackathons/${h.slug}`}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-400 hover:text-blue-600">
                      <ExternalLink size={16} />
                    </Link>
                    <button onClick={() => handleRemove(h.slug)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
