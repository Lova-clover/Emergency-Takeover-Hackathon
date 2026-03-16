import type {
  Bookmark,
  DemoLeaderboardEntry,
  LocalTeamDraft,
  SubmissionDraft,
  TeamItem,
  UserPreferences,
} from '@/types';

const BOOKMARKS_KEY = 'daker_bookmarks';
const PREFS_KEY = 'daker_prefs';
const RECENT_KEY = 'daker_recent';
const LOCAL_TEAMS_KEY = 'daker_local_teams';
const SUBMISSIONS_KEY = 'daker_submission_drafts';

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded – ignore */ }
}

// ─── Bookmarks ───
export function getBookmarks(): Bookmark[] {
  return getItem<Bookmark[]>(BOOKMARKS_KEY, []);
}

export function addBookmark(slug: string): void {
  const bm = getBookmarks().filter((b) => b.slug !== slug);
  bm.unshift({ slug, addedAt: new Date().toISOString() });
  setItem(BOOKMARKS_KEY, bm);
}

export function removeBookmark(slug: string): void {
  setItem(BOOKMARKS_KEY, getBookmarks().filter((b) => b.slug !== slug));
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().some((b) => b.slug === slug);
}

export function toggleBookmark(slug: string): boolean {
  if (isBookmarked(slug)) {
    removeBookmark(slug);
    return false;
  }
  addBookmark(slug);
  return true;
}

// ─── Recent views ───
export function getRecentSlugs(): string[] {
  return getItem<string[]>(RECENT_KEY, []);
}

export function addRecentSlug(slug: string): void {
  const recent = getRecentSlugs().filter((s) => s !== slug);
  recent.unshift(slug);
  setItem(RECENT_KEY, recent.slice(0, 10));
}

// ─── Theme ───
export function getTheme(): 'light' | 'dark' {
  const prefs = getItem<UserPreferences>(PREFS_KEY, { theme: 'light', recentSlugs: [], compareList: [] });
  return prefs.theme;
}

export function setTheme(theme: 'light' | 'dark'): void {
  const prefs = getItem<UserPreferences>(PREFS_KEY, { theme: 'light', recentSlugs: [], compareList: [] });
  prefs.theme = theme;
  setItem(PREFS_KEY, prefs);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function toggleTheme(): 'light' | 'dark' {
  const next = getTheme() === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
}

// ─── Compare List ───
export function getCompareList(): string[] {
  const prefs = getItem<UserPreferences>(PREFS_KEY, { theme: 'light', recentSlugs: [], compareList: [] });
  return prefs.compareList ?? [];
}

export function toggleCompare(slug: string): boolean {
  const prefs = getItem<UserPreferences>(PREFS_KEY, { theme: 'light', recentSlugs: [], compareList: [] });
  const list = prefs.compareList ?? [];
  const idx = list.indexOf(slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    prefs.compareList = list;
    setItem(PREFS_KEY, prefs);
    return false;
  }
  if (list.length >= 3) return false; // max 3
  list.push(slug);
  prefs.compareList = list;
  setItem(PREFS_KEY, prefs);
  return true;
}

export function isInCompare(slug: string): boolean {
  return getCompareList().includes(slug);
}

export function clearCompareList(): void {
  const prefs = getItem<UserPreferences>(PREFS_KEY, { theme: 'light', recentSlugs: [], compareList: [] });
  prefs.compareList = [];
  setItem(PREFS_KEY, prefs);
}

// ─── Local teams ───
function createTeamCode() {
  return `LOCAL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function getLocalTeams(): LocalTeamDraft[] {
  return getItem<LocalTeamDraft[]>(LOCAL_TEAMS_KEY, []);
}

export function saveLocalTeam(
  input: Omit<TeamItem, 'teamCode' | 'createdAt'> & { teamCode?: string }
): LocalTeamDraft {
  const nextTeam: LocalTeamDraft = {
    ...input,
    teamCode: input.teamCode ?? createTeamCode(),
    createdAt: new Date().toISOString(),
    source: 'local',
    createdByUser: true,
  };

  const teams = getLocalTeams();
  const existingIndex = teams.findIndex((team) => team.teamCode === nextTeam.teamCode);

  if (existingIndex >= 0) {
    teams[existingIndex] = {
      ...teams[existingIndex],
      ...nextTeam,
      createdAt: teams[existingIndex].createdAt,
    };
  } else {
    teams.unshift(nextTeam);
  }

  setItem(LOCAL_TEAMS_KEY, teams);
  return nextTeam;
}

export function deleteLocalTeam(teamCode: string): void {
  setItem(
    LOCAL_TEAMS_KEY,
    getLocalTeams().filter((team) => team.teamCode !== teamCode)
  );
}

export function toggleLocalTeamOpen(teamCode: string): void {
  const teams = getLocalTeams().map((team) =>
    team.teamCode === teamCode ? { ...team, isOpen: !team.isOpen } : team
  );
  setItem(LOCAL_TEAMS_KEY, teams);
}

// ─── Submission drafts ───
function normalizeFieldMap(fields: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, value.trim()])
  );
}

function isLikelyUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function isGibberishValue(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3) return true;
  const hasKorean = /[가-힣]/.test(trimmed);
  const hasSpaces = /\s/.test(trimmed);
  if (hasKorean && hasSpaces) return false;
  if (/(.)\1{3,}/.test(trimmed)) return true;
  if (!hasSpaces && !hasKorean && new Set(trimmed.toLowerCase()).size / trimmed.length < 0.3) return true;
  if (!hasSpaces && !hasKorean && trimmed.length < 8 && !isLikelyUrl(trimmed)) return true;
  return false;
}

export function calculateSubmissionReadiness(
  fields: Record<string, string>,
  requiredKeys: string[],
  notes = ''
): number {
  const normalized = normalizeFieldMap(fields);
  const fieldCount = requiredKeys.length || Object.keys(normalized).length || 1;

  // Quality-aware: gibberish or very short values count as 0.2, non-URL values count as 0.6
  let qualityScore = 0;
  for (const key of requiredKeys.length ? requiredKeys : Object.keys(normalized)) {
    const val = normalized[key] ?? '';
    if (!val) continue;
    if (isGibberishValue(val)) {
      qualityScore += 0.15; // nearly no credit for garbage
    } else if (isLikelyUrl(val)) {
      qualityScore += 1.0; // full credit for URLs
    } else if (val.length < 5) {
      qualityScore += 0.3; // partial credit for very short
    } else {
      qualityScore += 0.85; // good text content
    }
  }

  const urlBonus = Object.values(normalized).some(isLikelyUrl) ? 8 : 0;
  const notesTrimmed = notes.trim();
  const notesBonus = !notesTrimmed ? 0 : isGibberishValue(notesTrimmed) ? 1 : notesTrimmed.length >= 20 ? 6 : 3;
  const weighted = (qualityScore / fieldCount) * 78 + urlBonus + notesBonus;
  return Math.max(0, Math.min(100, Math.round(weighted)));
}

export function getSubmissionDrafts(hackathonSlug?: string): SubmissionDraft[] {
  const drafts = getItem<SubmissionDraft[]>(SUBMISSIONS_KEY, []);
  if (!hackathonSlug) return drafts;
  return drafts.filter((draft) => draft.hackathonSlug === hackathonSlug);
}

export function getLatestSubmissionDraft(hackathonSlug: string): SubmissionDraft | undefined {
  return getSubmissionDrafts(hackathonSlug)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
}

export function saveSubmissionDraft(
  input: Omit<SubmissionDraft, 'id' | 'createdAt' | 'updatedAt' | 'readiness'>
): SubmissionDraft {
  const requiredKeys = Object.keys(input.fields);
  const now = new Date().toISOString();
  const nextDraft: SubmissionDraft = {
    ...input,
    id: crypto.randomUUID(),
    readiness: calculateSubmissionReadiness(input.fields, requiredKeys, input.notes),
    createdAt: now,
    updatedAt: now,
  };

  const drafts = getSubmissionDrafts().filter((draft) => draft.id !== nextDraft.id);
  drafts.unshift(nextDraft);
  setItem(SUBMISSIONS_KEY, drafts);
  return nextDraft;
}

export function upsertSubmissionDraft(
  input: Omit<SubmissionDraft, 'id' | 'createdAt' | 'updatedAt' | 'readiness'> & { id?: string }
): SubmissionDraft {
  const drafts = getSubmissionDrafts();
  const existing = input.id ? drafts.find((draft) => draft.id === input.id) : undefined;
  const requiredKeys = Object.keys(input.fields);
  const now = new Date().toISOString();
  const nextDraft: SubmissionDraft = {
    ...input,
    id: existing?.id ?? input.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    readiness: calculateSubmissionReadiness(input.fields, requiredKeys, input.notes),
  };
  const nextDrafts = drafts.filter((draft) => draft.id !== nextDraft.id);
  nextDrafts.unshift(nextDraft);
  setItem(SUBMISSIONS_KEY, nextDrafts);
  return nextDraft;
}

export function submitSubmissionDraft(id: string): SubmissionDraft | undefined {
  let submittedDraft: SubmissionDraft | undefined;
  const nextDrafts = getSubmissionDrafts().map((draft) => {
    if (draft.id !== id) return draft;
    submittedDraft = {
      ...draft,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return submittedDraft;
  });
  setItem(SUBMISSIONS_KEY, nextDrafts);
  return submittedDraft;
}

export function deleteSubmissionDraft(id: string): void {
  setItem(
    SUBMISSIONS_KEY,
    getSubmissionDrafts().filter((draft) => draft.id !== id)
  );
}

export function getDemoLeaderboardEntries(hackathonSlug: string): DemoLeaderboardEntry[] {
  const submitted = getSubmissionDrafts(hackathonSlug).filter((draft) => draft.status === 'submitted');

  const entries = submitted
    .map((draft) => {
      const fieldsCompleted = Object.values(draft.fields).filter(Boolean).length;
      const freshnessBonus = draft.submittedAt
        ? Math.max(
            0,
            8 - Math.min(8, Math.floor((Date.now() - new Date(draft.submittedAt).getTime()) / (1000 * 60 * 60 * 24)))
          )
        : 0;
      const score = Math.min(99.9, +(draft.readiness * 0.82 + fieldsCompleted * 2.6 + freshnessBonus).toFixed(1));
      return {
        teamName: draft.teamName,
        score,
        submittedAt: draft.submittedAt ?? draft.updatedAt,
        readiness: draft.readiness,
        fieldsCompleted,
      };
    })
    .sort((a, b) => b.score - a.score);

  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
