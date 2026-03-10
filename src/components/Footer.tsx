export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">DAKER</span>
            <span className="text-gray-400 dark:text-gray-500 text-sm">- AI 서비스개발 히어로의 여정</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="https://dacon.io" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
              DACON
            </a>
            <a href="https://daker.ai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
              DAKER
            </a>
            <span>© 2026 DACON Inc.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
