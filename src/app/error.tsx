'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" role="alert">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertTriangle size={36} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">오류가 발생했습니다</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
          페이지를 불러오는 중 문제가 발생했습니다.<br />문제가 계속되면 새로고침해주세요.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono bg-gray-100 dark:bg-slate-800 rounded px-3 py-1.5 inline-block">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium focus-ring"
          >
            <RefreshCw size={16} />
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium focus-ring"
          >
            <Home size={16} />
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
