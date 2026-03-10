export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-2xl mb-10" />

      {/* Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg flex-1 max-w-md" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg" />
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded mb-4" />
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-md" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-md" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-md" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
