/* ───────────────────────────────────────────────
   Types – mirrors the exact provided JSON schema
   ─────────────────────────────────────────────── */

// ───── public_hackathons.json ─────
export interface HackathonListItem {
  slug: string;
  title: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  tags: string[];
  thumbnailUrl: string;
  period: {
    timezone: string;
    submissionDeadlineAt: string;
    endAt: string;
  };
  links: {
    detail: string;
    rules: string;
    faq: string;
  };
}

// ───── public_hackathon_detail.json ─────
export interface HackathonDetail {
  slug: string;
  title: string;
  sections: HackathonSections;
}

export interface HackathonSections {
  overview: {
    summary: string;
    teamPolicy: { allowSolo: boolean; maxTeamSize: number };
  };
  info: {
    notice: string[];
    links: { rules: string; faq: string };
  };
  eval: {
    metricName: string;
    description: string;
    scoreSource?: string;
    limits?: { maxRuntimeSec: number; maxSubmissionsPerDay: number };
    scoreDisplay?: {
      label: string;
      breakdown: { key: string; label: string; weightPercent: number }[];
    };
  };
  schedule: {
    timezone: string;
    milestones: Milestone[];
  };
  prize: {
    items: PrizeItem[];
  };
  teams: {
    campEnabled: boolean;
    listUrl: string;
  };
  submit: {
    allowedArtifactTypes: string[];
    submissionUrl: string;
    guide: string[];
    submissionItems?: SubmissionItem[];
  };
  leaderboard: {
    publicLeaderboardUrl: string;
    note: string;
  };
}

export interface Milestone {
  name: string;
  at: string;
}

export interface PrizeItem {
  place: string;
  amountKRW: number;
}

export interface SubmissionItem {
  key: string;
  title: string;
  format: string;
}

// ───── public_leaderboard.json ─────
export interface LeaderboardData {
  hackathonSlug: string;
  updatedAt: string;
  entries: LeaderboardEntry[];
  extraLeaderboards?: LeaderboardData[];
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  score: number;
  submittedAt: string;
  scoreBreakdown?: { participant: number; judge: number };
  artifacts?: {
    webUrl?: string;
    pdfUrl?: string;
    planTitle?: string;
  };
}

// ───── public_teams.json ─────
export interface TeamItem {
  teamCode: string;
  hackathonSlug: string;
  name: string;
  isOpen: boolean;
  memberCount: number;
  maxSize?: number;
  lookingFor: string[];
  intro: string;
  contact: { type: string; url: string };
  createdAt: string;
}

// ───── App-specific (locally managed) ─────
export interface Bookmark {
  slug: string;
  addedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  recentSlugs: string[];
  compareList: string[];
}

export interface LocalTeamDraft extends TeamItem {
  source: 'seed' | 'local';
  createdByUser?: boolean;
}

export interface SubmissionDraft {
  id: string;
  hackathonSlug: string;
  teamName: string;
  notes: string;
  status: 'draft' | 'submitted';
  fields: Record<string, string>;
  readiness: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface DemoLeaderboardEntry {
  rank: number;
  teamName: string;
  score: number;
  submittedAt: string;
  readiness: number;
  fieldsCompleted: number;
}

// Aliases used by pages
export type Hackathon = HackathonListItem;
export type Team = TeamItem;
