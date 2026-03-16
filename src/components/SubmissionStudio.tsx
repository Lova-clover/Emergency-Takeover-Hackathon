'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BotMessageSquare,
  FileCheck2,
  FileText,
  Globe,
  Rocket,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
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

interface FeedbackItem {
  status: 'success' | 'warning' | 'error';
  message: string;
}

function generateFeedback(
  fields: Record<string, string>,
  teamName: string,
  notes: string
): FeedbackItem[] {
  const items: FeedbackItem[] = [];

  // Helper: detect gibberish (no spaces, no Korean, mostly random chars)
  const isGibberish = (text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.length < 3) return true;
    const hasKorean = /[가-힣]/.test(trimmed);
    const hasSpaces = /\s/.test(trimmed);
    const hasRepeatingChars = /(.)\1{3,}/.test(trimmed);
    const uniqueRatio = new Set(trimmed.toLowerCase()).size / trimmed.length;
    if (hasKorean && hasSpaces) return false;
    if (hasRepeatingChars) return true;
    if (!hasSpaces && !hasKorean && uniqueRatio < 0.3) return true;
    if (!hasSpaces && !hasKorean && trimmed.length < 8) return true;
    return false;
  };

  if (!teamName) items.push({ status: 'warning', message: '팀명을 입력하면 심사에 도움이 됩니다' });
  else items.push({ status: 'success', message: `팀명 "${teamName}" 확인됨` });

  for (const [key, value] of Object.entries(fields)) {
    const v = value?.trim() ?? '';
    const isUrlField = key.toLowerCase().includes('web') || key.toLowerCase().includes('url') || key.toLowerCase().includes('github') || key.toLowerCase().includes('link');
    const isPdfField = key.toLowerCase().includes('pdf') || key.toLowerCase().includes('doc') || key.toLowerCase().includes('ppt');

    if (!v) {
      const hint = isUrlField
        ? ' - Vercel 배포 URL을 입력하세요'
        : isPdfField
          ? ' - PDF 파일 링크를 첨부하세요'
          : '';
      items.push({ status: 'error', message: `${key} 항목이 비어있습니다${hint}` });
    } else if (isGibberish(v)) {
      items.push({ status: 'error', message: `${key}: 의미 없는 텍스트가 감지됨 — 실제 내용을 입력하세요` });
    } else if ((isUrlField || isPdfField) && !v.startsWith('http')) {
      items.push({ status: 'warning', message: `${key}: URL 형식이 아닙니다 (https://로 시작하는 링크를 입력하세요)` });
    } else if (v.startsWith('http')) {
      try {
        new URL(v);
        items.push({ status: 'success', message: `${key}: 유효한 URL 형식` });
      } catch {
        items.push({ status: 'warning', message: `${key}: URL 형식이 올바르지 않습니다` });
      }
    } else if (v.length < 5) {
      items.push({ status: 'warning', message: `${key}: 내용이 너무 짧습니다 (더 상세히 작성하세요)` });
    } else {
      items.push({ status: 'success', message: `${key}: 입력 완료` });
    }
  }

  if (!notes?.trim()) items.push({ status: 'warning', message: '부가 설명을 추가하면 심사에 도움이 됩니다' });
  else if (isGibberish(notes.trim())) items.push({ status: 'error', message: '부가 설명에 의미 없는 텍스트가 감지됨' });
  else if (notes.trim().length < 20) items.push({ status: 'warning', message: '부가 설명이 짧습니다 — 20자 이상 권장' });
  else items.push({ status: 'success', message: '부가 설명 작성됨' });

  return items;
}

function getGrade(readiness: number): { letter: string; color: string; message: string } {
  if (readiness >= 90) return { letter: 'A', color: '#22c55e', message: '🎉 완벽에 가깝습니다! 제출 준비 완료!' };
  if (readiness >= 70) return { letter: 'B', color: '#3b82f6', message: '👍 좋은 진행도입니다. 조금만 더 채워보세요.' };
  if (readiness >= 50) return { letter: 'C', color: '#f59e0b', message: '💪 절반 이상 완성! 빈 항목을 확인하세요.' };
  return { letter: 'D', color: '#ef4444', message: '🚀 아직 초기 단계입니다. 핵심 항목부터 채워보세요.' };
}

const statusIcon: Record<string, string> = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

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
  const [showFeedback, setShowFeedback] = useState(false);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

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
    setShowFeedback(true);
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
            }))).map((item) => {
              const isPdfOrDoc = /pdf|doc|ppt|zip|csv/i.test(item.format) || /pdf|doc|ppt|zip|csv/i.test(item.key);
              const isUrlField = /url|web|link|github/i.test(item.format) || /url|web|link|github/i.test(item.key);

              return (
              <div key={item.key} className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--fg)]">
                  <FileText size={14} className="text-[var(--muted-fg)]" />
                  {item.title}
                  <span className="badge bg-black/6 text-[var(--muted-fg)] dark:bg-white/8">{item.format}</span>
                </span>

                {isPdfOrDoc ? (
                  <div className="space-y-2">
                    {fileNames[item.key] ? (
                      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                        <FileCheck2 size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300 truncate flex-1">
                          {fileNames[item.key]}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFileNames(prev => { const n = {...prev}; delete n[item.key]; return n; });
                            setFields(prev => ({...prev, [item.key]: ''}));
                          }}
                          className="rounded-full p-1 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-black/12 bg-white/50 px-4 py-6 cursor-pointer transition hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 dark:border-white/12 dark:bg-white/3">
                        <Upload size={24} className="text-[var(--muted-fg)]" />
                        <span className="text-sm text-[var(--muted-fg)]">클릭하여 파일 선택 또는 드래그 앤 드롭</span>
                        <span className="text-xs text-[var(--muted-fg)]">{item.format.toUpperCase()} 파일 (최대 2MB)</span>
                        <input
                          type="file"
                          accept={isPdfOrDoc ? '.pdf,.doc,.docx,.ppt,.pptx,.zip,.csv' : '*'}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              toast('파일이 2MB를 초과합니다. URL로 제출해주세요.', 'error');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFields(prev => ({...prev, [item.key]: reader.result as string}));
                              setFileNames(prev => ({...prev, [item.key]: file.name}));
                              toast(`${file.name} 업로드 완료`, 'success');
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    )}
                    <div className="text-center">
                      <span className="text-xs text-[var(--muted-fg)]">또는 URL로 입력:</span>
                    </div>
                    <input
                      type="url"
                      value={fileNames[item.key] ? '' : (fields[item.key] ?? '')}
                      onChange={(event) => {
                        setFileNames(prev => { const n = {...prev}; delete n[item.key]; return n; });
                        setFields(prev => ({...prev, [item.key]: event.target.value}));
                      }}
                      disabled={!!fileNames[item.key]}
                      className="rounded-2xl border border-black/8 bg-white/75 px-4 py-3 text-sm outline-none focus:border-[var(--primary)] dark:border-white/10 dark:bg-white/5 disabled:opacity-40"
                      placeholder="https://drive.google.com/... 또는 파일 링크"
                    />
                  </div>
                ) : (
                  <textarea
                    value={fields[item.key] ?? ''}
                    onChange={(event) =>
                      setFields((prev) => ({
                        ...prev,
                        [item.key]: event.target.value,
                      }))
                    }
                    rows={isUrlField ? 2 : 4}
                    className="min-h-24 rounded-3xl border border-black/8 bg-white/75 px-4 py-3 text-sm outline-none focus:border-[var(--primary)] dark:border-white/10 dark:bg-white/5"
                    placeholder={inferPlaceholder(item.key)}
                  />
                )}
              </div>
              );
            })}
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

        {showFeedback && (
          <div className="surface-panel p-6">
            <div className="eyebrow mb-3 inline-flex items-center gap-2">
              <BotMessageSquare size={14} />
              AI 피드백 리포트
            </div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h4 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">제출물 분석</h4>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-black text-white"
                style={{ backgroundColor: getGrade(readiness).color }}
              >
                {getGrade(readiness).letter}
              </div>
            </div>
            <p className="mb-4 text-sm text-[var(--muted-fg)]">{getGrade(readiness).message}</p>
            <div className="space-y-2">
              {generateFeedback(fields, teamName, notes).map((fb, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    borderColor:
                      fb.status === 'error'
                        ? 'rgba(239,68,68,0.3)'
                        : fb.status === 'warning'
                          ? 'rgba(245,158,11,0.3)'
                          : 'rgba(34,197,94,0.2)',
                    backgroundColor:
                      fb.status === 'error'
                        ? 'rgba(239,68,68,0.06)'
                        : fb.status === 'warning'
                          ? 'rgba(245,158,11,0.06)'
                          : 'rgba(34,197,94,0.04)',
                  }}
                >
                  <span className="shrink-0">{statusIcon[fb.status]}</span>
                  <span className="text-[var(--fg)]">{fb.message}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-black/6 bg-[var(--panel-soft)] p-4 text-sm dark:border-white/8">
              <div className="text-[var(--muted-fg)]">종합 완성도</div>
              <div className="mt-1 flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/6 dark:bg-white/8">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${readiness}%`,
                      backgroundColor: getGrade(readiness).color,
                    }}
                  />
                </div>
                <span className="font-semibold text-[var(--fg)]">{readiness}점</span>
              </div>
            </div>
          </div>
        )}

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
