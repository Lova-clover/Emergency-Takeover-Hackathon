'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GitCompare, Trash2, Trophy, Calendar, Users, Award, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { getCompareList, clearCompareList, toggleCompare } from '@/lib/storage';
import { getHackathonDetail, getHackathons, getLeaderboard, getTeamsByHackathon } from '@/lib/data-service';
import { cn, formatKRW, getDDayLabel, formatScore } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import EmptyState from '@/components/ui/EmptyState';
import { useHydrated } from '@/hooks/useHydrated';

export default function ComparePage() {
  const { toast } = useToast();
  const hydrated = useHydrated();
  const [, setVersion] = useState(0);
  const slugs = hydrated ? getCompareList() : [];

  const handleRemove = (slug: string) => {
    toggleCompare(slug);
    setVersion((value) => value + 1);
    window.dispatchEvent(new CustomEvent('compare-changed'));
    toast('비교에서 제거했습니다', 'info');
  };

  const handleClearAll = () => {
    clearCompareList();
    setVersion((value) => value + 1);
    window.dispatchEvent(new CustomEvent('compare-changed'));
    toast('비교함을 비웠습니다', 'info');
  };

  const items = slugs
    .map((slug) => {
      const hackathon = getHackathons().find((h) => h.slug === slug);
      const detail = getHackathonDetail(slug);
      const lb = getLeaderboard(slug);
      const teams = getTeamsByHackathon(slug);
      return { slug, hackathon, detail, lb, teams };
    })
    .filter((item) => item.detail);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <section className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <GitCompare size={28} className="text-violet-500" />
          <h1 className="text-3xl font-extrabold tracking-tight">해커톤 비교</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">선택한 해커톤을 나란히 비교해 보세요.</p>
      </section>

      {items.length === 0 ? (
        <EmptyState
          emoji="⚖️"
          title="비교할 해커톤이 없습니다"
          description="해커톤 목록에서 비교 버튼을 눌러 최대 3개까지 추가하세요."
          action={<Link href="/" className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus-ring">해커톤 목록 보기</Link>}
        />
      ) : (
        <>
          {/* Actions */}
          <div className="flex items-center justify-between mb-6 animate-slide-up">
            <p className="text-sm text-gray-500"><strong className="text-gray-900 dark:text-gray-100">{items.length}</strong>개 비교 중(최대 3개)</p>
            <button onClick={handleClearAll} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors focus-ring rounded px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 size={14} /> 전체 비우기
            </button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto animate-fade-in">
            <div className={cn('grid gap-4 min-w-[600px]', items.length === 1 ? 'grid-cols-[200px_1fr]' : items.length === 2 ? 'grid-cols-[200px_1fr_1fr]' : 'grid-cols-[200px_1fr_1fr_1fr]')}>

              {/* Header row */}
              <div />
              {items.map((item) => (
                <div key={item.slug} className="bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 p-5 text-center relative">
                  <button onClick={() => handleRemove(item.slug)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors focus-ring"
                    aria-label="비교에서 제거">
                    <XCircle size={16} />
                  </button>
                  <Link href={`/hackathons/${item.slug}`} className="font-bold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 focus-ring rounded">
                    {item.detail!.title}
                  </Link>
                  {item.hackathon && (
                    <span className={cn('badge text-[10px] mt-2 inline-block',
                      item.hackathon.status === 'ongoing' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      item.hackathon.status === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-500'
                    )}>
                      {item.hackathon.status === 'ongoing' ? '진행중' : item.hackathon.status === 'upcoming' ? '예정' : '종료'}
                    </span>
                  )}
                </div>
              ))}

              {/* Row helper */}
              {renderComparisonRow('참가 형태', items.map((i) => i.detail!.sections.overview.teamPolicy.allowSolo ? '개인/팀' : '팀 전용'), Users)}
              {renderComparisonRow('최대 팀 규모', items.map((i) => `${i.detail!.sections.overview.teamPolicy.maxTeamSize}명`), Users)}
              {renderComparisonRow('평가 지표', items.map((i) => i.detail!.sections.eval.metricName), Trophy)}
              {renderComparisonRow('태그', items.map((i) => i.hackathon?.tags.join(', ') ?? '-'), Tag)}
              {renderComparisonRow('총 상금', items.map((i) => formatKRW(i.detail!.sections.prize.items.reduce((s, p) => s + p.amountKRW, 0))), Award)}
              {renderComparisonRow('1위 상금', items.map((i) => {
                const first = i.detail!.sections.prize.items.find((p) => p.place === '1st');
                return first ? formatKRW(first.amountKRW) : '-';
              }), Award)}
              {renderComparisonRow('일정 수', items.map((i) => `${i.detail!.sections.schedule.milestones.length}개`), Calendar)}
              {renderComparisonRow('D-Day', items.map((i) => {
                const ms = i.detail!.sections.schedule.milestones;
                const next = ms.find(m => new Date(m.at).getTime() > Date.now());
                return next ? getDDayLabel(next.at) : '종료';
              }), Calendar)}
              {renderComparisonRow('캠프 활성화', items.map((i) => i.detail!.sections.teams.campEnabled ? '예' : '아니요'), Users)}
              {renderComparisonRow('등록 팀 수', items.map((i) => `${i.teams.length}팀`), Users)}
              {renderComparisonRow('리더보드 수', items.map((i) => i.lb ? `${i.lb.entries.length}팀` : '-'), Trophy)}
              {renderComparisonRow('1위 팀', items.map((i) => i.lb?.entries[0]?.teamName ?? '-'), Trophy)}
              {renderComparisonRow('1위 점수', items.map((i) => i.lb?.entries[0] ? formatScore(i.lb.entries[0].score) : '-'), Trophy)}
              {renderComparisonRow('제출 형태', items.map((i) => i.detail!.sections.submit.allowedArtifactTypes.join(', ')), CheckCircle2)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function renderComparisonRow(label: string, values: string[], Icon: React.ComponentType<{ size?: number; className?: string }>) {
  return (
    <>
      <div className="flex items-center gap-2 py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-900/30 rounded-lg">
        <Icon size={14} className="text-gray-400 shrink-0" />
        <span>{label}</span>
      </div>
      {values.map((val, i) => (
        <div key={i} className="flex items-center justify-center py-3 px-3 text-sm text-center text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700/30">
          {val}
        </div>
      ))}
    </>
  );
}
