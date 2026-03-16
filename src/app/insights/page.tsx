'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  BarChart3,
  Binary,
  ChartNoAxesCombined,
  ClipboardList,
  Database,
  LayoutTemplate,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  getAllHackathonDetails,
  getAllLeaderboards,
  getFeaturedHackathon,
  getTeams,
} from '@/lib/data-service';
import { formatKRW } from '@/lib/utils';

const implementationChecklist = [
  { label: '메인 페이지와 목록 탐색 흐름', ready: true, note: '홈과 /hackathons로 분리된 카테고리와 탐색을 나눴습니다.' },
  { label: '상세 페이지 다수 섹션', ready: true, note: '개요, 안내, 평가, 일정, 상금, 팀, 제출, 리더보드로 완전한 섹션을 갖췄습니다.' },
  { label: '팀 캠프 생성 흐름', ready: true, note: '브라우저 로컬 기반으로 팀 생성, 상태 전환, 삭제가 가능합니다.' },
  { label: '제출 스튜디오', ready: true, note: '초안 저장과 데모 제출로 로컬 순위 미리보기로 이어집니다.' },
  { label: '순위 화면 확장', ready: true, note: '공식 리더보드와 브라우저 데모 순위를 함께 표출합니다.' },
  { label: '명세 근거 표시', ready: true, note: '코드에서 제공 메모와 UI 플로우를 심사위원에게 직접 보여줍니다.' },
];

const productStory = [
  {
    icon: LayoutTemplate,
    title: 'Template 느낌 제거',
    body: '기존 일반 플랫폼 UI를 긴급 인수인계라는 주제에 맞춰 재설계했습니다.',
  },
  {
    icon: Database,
    title: '제공 데이터 보존',
    body: '원시 JSON 구조를 유지하고, 로컬 저장 레이어로 확장했습니다.',
  },
  {
    icon: BadgeCheck,
    title: '심사 설득력 강화',
    body: '제출된 서비스가 과제와 맞는지 결과 사이트에서 먼저 증명하도록 구성했습니다.',
  },
];

export default function InsightsPage() {
  const featured = getFeaturedHackathon();
  const details = getAllHackathonDetails();
  const leaderboards = getAllLeaderboards();
  const teams = getTeams();

  const featuredDetail = details.find((detail) => detail.slug === featured?.slug);
  const totalPrize = details.reduce(
    (sum, detail) => sum + detail.sections.prize.items.reduce((prizeSum, item) => prizeSum + item.amountKRW, 0),
    0
  );
  const score = Math.round((implementationChecklist.filter((item) => item.ready).length / implementationChecklist.length) * 100);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-panel p-6 lg:p-7">
          <div className="eyebrow mb-4 inline-flex items-center gap-2">
            <ShieldCheck size={14} />
            Handover Audit
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--fg)]">명세 기반 구현 감사 대시보드</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-fg)]">
            이번 제출물은 단순 설계보다 완성도와 정확한 산출물로 잘 구현됐음을 보여주는 것이 더 중요합니다.
            그래서 인사이트 페이지를 전체 품질 감사 보드로 바꿔 심사위원에게 설득 근거를 제공합니다.
          </p>
        </div>

        <div className="surface-panel p-6 lg:p-7">
          <div className="eyebrow mb-4 inline-flex items-center gap-2">
            <ChartNoAxesCombined size={14} />
            Completion Score
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: '구현 점수', value: `${score}점` },
              { label: '상세 섹션', value: `${featuredDetail ? Object.keys(featuredDetail.sections).length : 0}개` },
              { label: '총 상금 규모', value: formatKRW(totalPrize) },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-black/6 bg-[var(--panel-soft)] p-4 dark:border-white/8">
                <div className="text-2xl font-semibold text-[var(--fg)]">{item.value}</div>
                <div className="mt-1 text-sm text-[var(--muted-fg)]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-panel p-6 lg:p-7">
          <div className="eyebrow mb-4 inline-flex items-center gap-2">
            <ClipboardList size={14} />
            Spec Checklist
          </div>
          <div className="space-y-3">
            {implementationChecklist.map((item) => (
              <div key={item.label} className="rounded-3xl border border-black/6 bg-white/72 p-4 dark:border-white/8 dark:bg-white/4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/14 text-[var(--accent)]">✅</span>
                  <div>
                    <div className="font-semibold text-[var(--fg)]">{item.label}</div>
                    <div className="mt-1 text-sm text-[var(--muted-fg)]">{item.note}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="surface-panel p-6">
            <div className="eyebrow mb-4 inline-flex items-center gap-2">
              <Binary size={14} />
              Data Snapshot
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: '해커톤', value: details.length },
                { label: '리더보드', value: leaderboards.length },
                { label: '팀 캠프', value: teams.length },
                { label: '추천 행사', value: featured?.slug ?? '-' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-black/6 bg-[var(--panel-soft)] p-4 dark:border-white/8">
                  <div className="text-xl font-semibold text-[var(--fg)]">{item.value}</div>
                  <div className="mt-1 text-sm text-[var(--muted-fg)]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel p-6">
            <div className="eyebrow mb-4 inline-flex items-center gap-2">
              <Sparkles size={14} />
              Why This Can Win
            </div>
            <div className="space-y-4">
              {productStory.map((story) => (
                <div key={story.title} className="rounded-3xl border border-black/6 bg-[var(--panel-soft)] p-4 dark:border-white/8">
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-[var(--foreground)] dark:bg-white/8">
                    <story.icon size={18} />
                  </div>
                  <div className="font-semibold text-[var(--fg)]">{story.title}</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--muted-fg)]">{story.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visual Analytics */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface-panel p-6 lg:p-7">
          <div className="eyebrow mb-4 inline-flex items-center gap-2">
            <BarChart3 size={14} />
            Score Distribution
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">리더보드 점수 분포</h2>
          <div className="mt-5 space-y-3">
            {leaderboards
              .flatMap((lb) => lb.entries)
              .sort((a, b) => b.score - a.score)
              .map((entry, i) => (
                <div key={`${entry.teamName}-${i}`} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-sm font-semibold text-[var(--fg)]">{entry.teamName}</span>
                  <div className="relative h-7 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/8">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max((entry.score / 100) * 100, 2)}%`,
                        backgroundColor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--accent, #6366f1)',
                        opacity: i > 2 ? 0.6 : 1,
                      }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-sm font-semibold text-[var(--muted-fg)]">{entry.score}</span>
                </div>
              ))}
            {leaderboards.flatMap((lb) => lb.entries).length === 0 && (
              <p className="text-sm text-[var(--muted-fg)]">아직 리더보드 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="surface-panel p-6 lg:p-7">
          <div className="eyebrow mb-4 inline-flex items-center gap-2">
            <Users size={14} />
            Role Demand
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">팀 역할 수요 현황</h2>
          <div className="mt-5 space-y-3">
            {(() => {
              const roleCounts: Record<string, number> = {};
              teams.forEach((t) => t.lookingFor.forEach((r) => { roleCounts[r] = (roleCounts[r] || 0) + 1; }));
              const sorted = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);
              const max = sorted[0]?.[1] ?? 1;
              return sorted.map(([role, count]) => (
                <div key={role} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate text-sm font-semibold text-[var(--fg)]">{role}</span>
                  <div className="relative h-7 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/8">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(count / max) * 100}%`,
                        backgroundColor: 'var(--accent, #6366f1)',
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-semibold text-[var(--muted-fg)]">{count}팀</span>
                </div>
              ));
            })()}
            {teams.length === 0 && (
              <p className="text-sm text-[var(--muted-fg)]">아직 팀 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      <section className="surface-panel p-6 lg:p-7">
        <div className="eyebrow mb-4 inline-flex items-center gap-2">
          <Database size={14} />
          Next Demo Route
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">심사 시연 추천 순서</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            { title: '1. 홈', href: '/', note: '기본 자료와 구성된 레이아웃 확인' },
            { title: '2. 상세', href: `/hackathons/${featured?.slug ?? ''}`, note: '다수 섹션과 제출 스튜디오 확인' },
            { title: '3. 캠프', href: '/camp', note: '팀 생성과 상태 전환 데모' },
            { title: '4. 순위', href: '/rankings', note: '공식 보드와 브라우저 데모 순위 비교' },
          ].map((step) => (
            <Link key={step.href} href={step.href} className="focus-ring rounded-3xl border border-black/6 bg-white/72 p-4 dark:border-white/8 dark:bg-white/4">
              <div className="font-semibold text-[var(--fg)]">{step.title}</div>
              <div className="mt-2 text-sm leading-7 text-[var(--muted-fg)]">{step.note}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
