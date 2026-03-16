import { CardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-busy="true" aria-label="페이지 로딩 중">
      {/* Hero skeleton */}
      <div className="mb-10 animate-fade-in">
        <div className="skeleton h-10 w-64 rounded-lg mb-3" />
        <div className="skeleton h-5 w-96 rounded-lg" />
      </div>
      {/* Filter bar skeleton */}
      <div className="flex gap-3 mb-8">
        <div className="skeleton h-10 w-32 rounded-lg" />
        <div className="skeleton h-10 w-32 rounded-lg" />
        <div className="skeleton h-10 flex-1 max-w-xs rounded-lg" />
      </div>
      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ animationDelay: `${i * 80}ms` }} className="animate-fade-in">
            <CardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
