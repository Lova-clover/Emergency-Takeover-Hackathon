'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  FileText,
  Globe,
  Rocket,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  calculateSubmissionReadiness,
  deleteSubmissionDraft,
  getDemoLeaderboardEntries,
  getLatestSubmissionDraft,
  getSubmissionDrafts,
  submitSubmissionDraft,
  upsertSubmissionDraft,
} from '@/lib/storage';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { useHydrated } from '@/hooks/useHydrated';
import type { SubmissionDraft, SubmissionItem } from '@/types';

interface SubmissionStudioProps {
  allowedArtifactTypes: string[];
  guide: string[];
  hackathonSlug: string;
  submissionItems?: SubmissionItem[];
  title: string;
}

function inferPlaceholder(key: string) {
  if (key.toLowerCase().includes('web')) return 'https://your-demo.vercel.app';
  if (key.toLowerCase().includes('pdf')) return 'https://your-storage.example/final.pdf';
  if (key.toLowerCase().includes('plan')) return '핵심 기획서 또는 URL을 입력하세요';
  return '제출 내용을 입력하세요';
}

export default function SubmissionStudio({
  allowedArtifactTypes,
  guide,
  hackathonSlug,
  submissionItems,
  title,
}: SubmissionStudioProps) {
  const { toast } = useToast();
  const hydrated = useHydrated();
  const fieldsTemplate = useMemo(() => {
    const items = submissionItems?.length
      ? submissionItems
      : allowedArtifactTypes.map((type, index) => ({
          key: `${type}-${index + 1}`,
          title: `${type.toUpperCase()} 제출`,
          format: type,
        }));

    return items.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = '';
      return acc;
    }, {});
  }, [allowedArtifactTypes, submissionItems]);

  const [draftId, setDraftId] = useState<string | undefined>();
  const [teamName, setTeamName] = useState('우리 팀');
  const [notes, setNotes] = useState('');
  const [fields, setFields] = useState<Record<string, string>>(fieldsTemplate);
  const [history, setHistory] = useState<SubmissionDraft[]>([]);

  const refresh = useCallback(() => {
    const latest = getLatestSubmissionDraft(hackathonSlug);
    if (latest) {
      setDraftId(latest.id);
      setTeamName(latest.teamName);
      setNotes(latest.notes);
      setFields({ ...fieldsTemplate, ...latest.fields });
    } else {
      setDraftId(undefined);
      setTeamName('우리 팀');
      setNotes('');
      setFields(fieldsTemplate);
    }
    setHistory(getSubmissionDrafts(hackathonSlug));
  }, [fieldsTemplate, hackathonSlug]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, [hydrated, refresh]);

  const readiness = useMemo(
    () => calculateSubmissionReadiness(fields, Object.keys(fieldsTemplate), notes),
    [fields, fieldsTemplate, notes]
  );

  const demoEntries = hydrated ? getDemoLeaderboardEntries(hackathonSlug) : [];

  const handleSave = () => {
    const saved = upsertSubmissionDraft({
      id: draftId,
      hackathonSlug,
      teamName: teamName.trim() || '우리 팀',
      notes,
      status: 'draft',
      fields,
    });
    setDraftId(saved.id);
    setHistory(getSubmissionDrafts(hackathonSlug));
    window.dispatchEvent(new CustomEvent('submission-changed'));
    toast('브라우저에서 제출 초안을 저장했습니다', 'success');
  };

  const handleSubmit = () => {
    const saved = upsertSubmissionDraft({
      id: draftId,
      hackathonSlug,
      teamName: teamName.trim() || '우리 팀',
      notes,
      status: 'draft',
      fields,
    });
    const submitted = submitSubmissionDraft(saved.id);
    setDraftId(submitted?.id);
    setHistory(getSubmissionDrafts(hackathonSlug));
    window.dispatchEvent(new CustomEvent('submission-changed'));
    toast('데모 제출이 로컬 순위에 반영되었습니다', 'success');
  };

  const handleDelete = (id: string) => {
    deleteSubmissionDraft(id);
    refresh();
    window.dispatchEvent(new CustomEvent('submission-changed'));
    toast('제출 기록을 삭제했습니다', 'info');
  };

  const completionCount = Object.values(fields).filter(Boolean).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="surface-panel p-6">
        <div className="eyebrow mb-3 inline-flex items-center gap-2">
          <Rocket size={14} />
          Submission Studio
        </div>
        <h3 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{title} 제출 워크스페이스</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--muted-fg)]">
          브라우저 로컬 기반 데모 제출 흐름입니다. 서버 없이 기획서, 배포 URL, PDF 제출 경험과 순위 반영까지 확인할 수 있습니다.
        </p>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--fg)]">팀 이름</span>
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              className="rounded-2xl border border-black/8 bg-white/75 px-4 py-3 text-sm outline-none focus:border-[var(--primary)] dark:border-white/10 dark:bg-white/5"
              placeholder="예: Hackathon Heroes"
            />
          </label>

          <div className="grid gap-4">
            {(submissionItems?.length ? submissionItems : Object.keys(fieldsTemplate).map((key) => ({
              key,
              title: key,
              format: key,
            }))).map((item) => (
              <label key={item.key} className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--fg)]">
                  <FileText size={14} className="text-[var(--muted-fg)]" />
                  {item.title}
                  <span className="badge bg-black/6 text-[var(--muted-fg)] dark:bg-white/8">{item.format}</span>
                </span>
                <textarea
                  value={fields[item.key] ?? ''}
                  onChange={(event) =>
                    setFields((prev) => ({
                      ...prev,
                      [item.key]: event.target.value,
                    }))
                  }
                  rows={item.format.includes('url') ? 2 : 4}
                  className="min-h-24 rounded-3xl border border-black/8 bg-white/75 px-4 py-3 text-sm outline-none focus:border-[var(--primary)] dark:border-white/10 dark:bg-white/5"
                  placeholder={inferPlaceholder(item.key)}
                />
              </label>
            ))}
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--fg)]">추가 메모</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="min-h-28 rounded-3xl border border-black/8 bg-white/75 px-4 py-3 text-sm outline-none focus:border-[var(--primary)] dark:border-white/10 dark:bg-white/5"
              placeholder="이번 버전의 강점, 차별점, 발표 시 강조할 포인트를 메모하세요."
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--fg)] transition hover:border-black/16 dark:border-white/10 dark:hover:border-white/18"
          >
            <Save size={15} />
            초안 저장
          </button>
          <button
            onClick={handleSubmit}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            <Rocket size={15} />
            데모 제출
          </button>
        </div>
      </section>

      <section className="grid gap-6">
        <div className="surface-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="eyebrow mb-3 inline-flex items-center gap-2">
                <Sparkles size={14} />
                Readiness
              </div>
              <h4 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{readiness}점</h4>
            </div>
            <div className="rounded-full bg-[var(--accent)]/14 px-3 py-1 text-sm font-medium text-[var(--accent)]">
              {completionCount}/{Object.keys(fieldsTemplate).length} 필드 완성
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/6 dark:bg-white/8">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#1d3557,#2a9d8f,#f4a261)]"
              style={{ width: `${readiness}%` }}
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/6 bg-[var(--panel-soft)] p-4 text-sm dark:border-white/8">
              <div className="text-[var(--muted-fg)]">제출 형태</div>
              <div className="mt-1 font-semibold text-[var(--fg)]">{allowedArtifactTypes.join(', ')}</div>
            </div>
            <div className="rounded-2xl border border-black/6 bg-[var(--panel-soft)] p-4 text-sm dark:border-white/8">
              <div className="text-[var(--muted-fg)]">현재 상태</div>
              <div className="mt-1 font-semibold text-[var(--fg)]">
                {history[0]?.status === 'submitted' ? '제출 완료' : '초안 작업 중'}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[26px] border border-black/6 bg-white/72 p-4 dark:border-white/8 dark:bg-white/4">
            <div className="mb-2 text-sm font-semibold text-[var(--fg)]">제출 가이드 핵심</div>
            <ul className="space-y-2 text-sm leading-7 text-[var(--muted-fg)]">
              {guide.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="surface-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="eyebrow mb-3 inline-flex items-center gap-2">
                <FileCheck2 size={14} />
                Local History
              </div>
              <h4 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">브라우저 제출 기록</h4>
            </div>
            <Link href="/rankings" className="focus-ring text-sm font-semibold text-[var(--primary)]">
              순위 보기
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {history.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-black/12 px-4 py-8 text-center text-sm text-[var(--muted-fg)] dark:border-white/12">
                아직 저장된 초안이 없습니다. 첫 초안을 저장하면 여기에서 다시 이어서 작업할 수 있습니다.
              </div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="rounded-3xl border border-black/6 bg-white/72 p-4 dark:border-white/8 dark:bg-white/4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[var(--fg)]">{entry.teamName}</p>
                        <span className="badge bg-black/6 text-[var(--muted-fg)] dark:bg-white/8">
                          {entry.status === 'submitted' ? 'submitted' : 'draft'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted-fg)]">{formatDateTime(entry.updatedAt)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="focus-ring rounded-full border border-black/8 p-2 text-[var(--muted-fg)] hover:text-[var(--destructive)] dark:border-white/10"
                      aria-label="제출 기록 삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted-fg)]">
                    <span className="badge bg-[var(--accent)]/12 text-[var(--accent)]">완성도 {entry.readiness}</span>
                    <span className="badge bg-black/6 text-[var(--muted-fg)] dark:bg-white/8">
                      입력 {Object.values(entry.fields).filter(Boolean).length}건
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {demoEntries.length > 0 && (
            <div className="mt-6 rounded-[26px] border border-black/6 bg-[linear-gradient(145deg,rgba(29,53,87,0.96),rgba(10,15,31,0.96))] p-5 text-white dark:border-white/10">
              <div className="flex items-center gap-2 text-sm text-white/72">
                <Globe size={14} />
                브라우저 데모 순위 미리보기
              </div>
              <div className="mt-4 space-y-3">
                {demoEntries.slice(0, 3).map((entry) => (
                  <div key={`${entry.rank}-${entry.teamName}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-4 py-3">
                    <div>
                      <div className="font-semibold">{entry.rank}위 · {entry.teamName}</div>
                      <div className="text-xs text-white/60">{formatDateTime(entry.submittedAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-[#ffcf95]">{entry.score}</div>
                      <div className="text-xs text-white/60">완성도 {entry.readiness}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
