import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-black/6 bg-[rgba(247,244,236,0.7)] dark:border-white/8 dark:bg-[#08111d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-3 flex items-center gap-3" aria-label="현황판">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d3557,#2a9d8f,#f4a261)]">
                <span className="text-xs font-extrabold text-white">ET</span>
              </div>
              <span className="text-lg font-semibold tracking-[-0.04em] text-[var(--fg)]">Emergency Takeover Room</span>
            </Link>
            <p className="text-sm leading-relaxed text-[var(--muted-fg)]">
              주어진 메모와 자료만으로 서비스를 복구하고,
              팀에게 심사위원을 설득할 수 있는 현장 경험까지 담은 애플리케이션 제출물입니다.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="서비스 네비게이션">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-fg)]">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="transition-colors text-[var(--muted-fg)] hover:text-[var(--primary)]">현황판</Link></li>
              <li><Link href="/hackathons" className="transition-colors text-[var(--muted-fg)] hover:text-[var(--primary)]">해커톤</Link></li>
              <li><Link href="/rankings" className="transition-colors text-[var(--muted-fg)] hover:text-[var(--primary)]">순위</Link></li>
              <li><Link href="/camp" className="transition-colors text-[var(--muted-fg)] hover:text-[var(--primary)]">캠프</Link></li>
            </ul>
          </nav>

          <nav aria-label="기능 네비게이션">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-fg)]">기능</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/insights" className="transition-colors text-[var(--muted-fg)] hover:text-[var(--primary)]">인수인계 감사</Link></li>
              <li><Link href="/source" className="transition-colors text-[var(--muted-fg)] hover:text-[var(--primary)]">인수인계 자료실</Link></li>
              <li><Link href="/bookmarks" className="transition-colors text-[var(--muted-fg)] hover:text-[var(--primary)]">북마크</Link></li>
              <li><Link href="/compare" className="transition-colors text-[var(--muted-fg)] hover:text-[var(--primary)]">비교하기</Link></li>
            </ul>
          </nav>

          {/* External */}
          <nav aria-label="외부 링크">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-fg)]">링크</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://dacon.io" target="_blank" rel="noopener noreferrer" className="transition-colors text-[var(--muted-fg)] hover:text-[var(--primary)]">DACON</a></li>
              <li><a href="https://daker.ai" target="_blank" rel="noopener noreferrer" className="transition-colors text-[var(--muted-fg)] hover:text-[var(--primary)]">DAKER</a></li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-black/6 pt-6 text-center sm:flex-row sm:text-left dark:border-white/8">
          <p className="text-xs text-[var(--muted-fg)]">© 2026 Emergency Takeover Hackathon Build</p>
          <p className="text-xs text-[var(--muted-fg)]">Built with Next.js · Designed for Vercel delivery</p>
        </div>
      </div>
    </footer>
  );
}
