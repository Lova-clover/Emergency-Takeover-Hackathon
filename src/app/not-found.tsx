'use client';

import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
          <Search size={28} className="text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.<br />
          URL을 확인하시거나 아래 링크를 이용해주세요.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium focus-ring"
          >
            <Home size={16} />
            홈으로 이동
          </Link>
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium focus-ring"
          >
            <ArrowLeft size={16} />
            이전 페이지
          </button>
        </div>
      </div>
    </div>
  );
}
