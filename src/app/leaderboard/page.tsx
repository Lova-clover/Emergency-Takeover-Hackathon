'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, FileDown, Globe, Rocket, Trophy } from 'lucide-react';
import { getAllLeaderboards, getFeaturedHackathon, getHackathonTitle } from '@/lib/data-service';
import { getDemoLeaderboardEntries } from '@/lib/storage';
import { cn, formatDateTime, formatScore, getRankEmoji } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

export default function LeaderboardPage() {
  const allLeaderboards = getAllLeaderboards();
  const featured = getFeaturedHackathon();
  const [selectedSlug, setSelectedSlug] = useState(featured?.slug ?? allLeaderboards[0]?.hackathonSlug ?? '');
  const [, setRefreshTick] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshTick((value) => value + 1);
    window.addEventListener('submission-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('submission-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const current = useMemo(
    () => allLeaderboards.find((leaderboard) => leaderboard.hackathonSlug === selectedSlug),
    [allLeaderboards, selectedSlug]
  );

  const demoEntries = getDemoLeaderboardEntries(selectedSlug);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="surface-panel p-6 lg:p-7">
          <div className="eyebrow mb-4 inline-flex items-center gap-2">
            <Trophy size={14} />
            Rankings
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--fg)]">공식 순위 + 브라우저 데모 순위</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-fg)]">
            제공된 공개 리더보드 데이터를 보여주되, 제출 스튜디오에서 만든 로컬 데모 제출도 함께 연결합니다.
            그래서 심사위원은 구현된 데이터와 흐름이 실제로 데모 가능한가를 한번에 볼 수 있습니다.
          </p>
        </div>

        <div className="surface-panel p-6 lg:p-7">
          <div className="eyebrow mb-4 inline-flex items-center gap-2">
            <Rocket size={14} />
            Demo Sync
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: '공식 리더보드', value: `${allLeaderboards.length}개` },
              { label: '선택된 데모 제출', value: `${demoEntries.length}건` },
              { label: '추천 메인 경로', value: '/submit → /rankings' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-black/6 bg-[var(--panel-soft)] p-4 dark:border-white/8">
                <div className="text-xl font-semibold text-[var(--fg)]">{item.value}</div>
                <div className="mt-1 text-sm text-[var(--muted-fg)]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="해커톤 선택">
          {allLeaderboards.map((leaderboard) => {
            const title = getHackathonTitle(leaderboard.hackathonSlug);
            const isSelected = selectedSlug === leaderboard.hackathonSlug;
            return (
              <button
                key={leaderboard.hackathonSlug}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedSlug(leaderboard.hackathonSlug)}
                className={cn('tab-item', isSelected && 'active')}
              >
                <span>{title}</span>
                <span className="rounded-full bg-black/6 px-2 py-0.5 text-[11px] dark:bg-white/8">
                  {leaderboard.entries.length}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {demoEntries.length > 0 && (
        <section className="surface-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="eyebrow mb-3 inline-flex items-center gap-2">
                <Rocket size={14} />
                Browser Demo
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">브라우저 제출 순위</h2>
            </div>
            <Link href={`/hackathons/${selectedSlug}`} className="focus-ring text-sm font-semibold text-[var(--primary)]">
              제출 화면으로 이동
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {demoEntries.slice(0, 3).map((entry) => (
              <div key={`${entry.rank}-${entry.teamName}`} className="rounded-[28px] border border-black/6 bg-[linear-gradient(160deg,rgba(29,53,87,0.96),rgba(10,15,31,0.96))] p-5 text-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.8)] dark:border-white/10">
                <div className="text-3xl">{getRankEmoji(entry.rank)}</div>
                <div className="mt-3 text-lg font-semibold">{entry.teamName}</div>
                <div className="mt-1 text-sm text-white/62">{formatDateTime(entry.submittedAt)}</div>
                <div className="mt-5 text-3xl font-semibold tracking-tight text-[#ffcf95]">{entry.score}</div>
                <div className="mt-1 text-sm text-white/62">완성도 {entry.readiness} · 입력 {entry.fieldsCompleted}건</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!current || current.entries.length === 0 ? (
        <EmptyState
          emoji="📭"
          title="공식 리더보드 데이터가 없습니다"
          description="선택된 해커톤에 공개 순위가 아직 없습니다."
        />
      ) : (
        <>
          <section className="surface-panel p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="eyebrow mb-3 inline-flex items-center gap-2">
                  <Calendar size={14} />
                  Official Board
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{getHackathonTitle(current.hackathonSlug)}</h2>
              </div>
              <div className="text-sm text-[var(--muted-fg)]">업데이트 {formatDateTime(current.updatedAt)}</div>
            </div>

            {current.entries.length >= 3 && (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[current.entries[1], current.entries[0], current.entries[2]].map((entry, index) => {
                  const podiumRank = [2, 1, 3][index];
                  return (
                    <div
                      key={`${entry.rank}-${entry.teamName}`}
                      className={cn(
                        'rounded-[28px] border p-5 text-center',
                        podiumRank === 1
                          ? 'border-yellow-200 bg-gradient-to-b from-yellow-50 to-white shadow-[0_26px_70px_-44px_rgba(250,204,21,0.45)] dark:border-yellow-900/40 dark:from-yellow-900/18 dark:to-white/2'
                          : podiumRank === 2
                            ? 'border-black/8 bg-white/72 dark:border-white/10 dark:bg-white/4'
                            : 'border-orange-200 bg-gradient-to-b from-orange-50 to-white dark:border-orange-900/40 dark:from-orange-900/18 dark:to-white/2'
                      )}
                    >
                      <div className="text-4xl">{getRankEmoji(podiumRank)}</div>
                      <div className="mt-3 text-lg font-semibold tracking-tight text-[var(--fg)]">{entry.teamName}</div>
                      <div className="mt-1 text-sm text-[var(--muted-fg)]">{formatDateTime(entry.submittedAt)}</div>
                      <div className="mt-5 text-3xl font-semibold tracking-tight text-[var(--primary)]">{formatScore(entry.score)}</div>
                      {entry.scoreBreakdown && (
                        <div className="mt-2 text-xs text-[var(--muted-fg)]">
                          참가자 {entry.scoreBreakdown.participant} · 심사위원 {entry.scoreBreakdown.judge}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="surface-panel overflow-hidden">
            <div className="grid grid-cols-[70px_1fr_auto] gap-4 border-b border-black/6 px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-fg)] dark:border-white/8">
              <span>순위</span>
              <span>팀</span>
              <span>점수</span>
            </div>

            {current.entries.map((entry, index) => (
              <div
                key={`${entry.rank}-${entry.teamName}`}
                className="grid grid-cols-[70px_1fr_auto] gap-4 border-b border-black/6 px-5 py-5 last:border-none dark:border-white/8"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="text-2xl">{getRankEmoji(entry.rank)}</div>
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--fg)]">{entry.teamName}</div>
                  <div className="mt-1 text-sm text-[var(--muted-fg)]">{formatDateTime(entry.submittedAt)}</div>
                  {entry.scoreBreakdown && (
                    <div className="mt-2 text-xs text-[var(--muted-fg)]">
                      참가자 {entry.scoreBreakdown.participant} · 심사위원 {entry.scoreBreakdown.judge}
                    </div>
                  )}
                  {entry.artifacts && (
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      {entry.artifacts.planTitle && (
                        <span className="badge bg-black/6 text-[var(--muted-fg)] dark:bg-white/8">{entry.artifacts.planTitle}</span>
                      )}
                      {entry.artifacts.webUrl && (
                        <a href={entry.artifacts.webUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1 text-[var(--primary)]">
                          <Globe size={12} />
                          배포 보기
                        </a>
                      )}
                      {entry.artifacts.pdfUrl && (
                        <a href={entry.artifacts.pdfUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1 text-[var(--muted-fg)]">
                          <FileDown size={12} />
                          PDF
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold tracking-tight text-[var(--primary)]">{formatScore(entry.score)}</div>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
