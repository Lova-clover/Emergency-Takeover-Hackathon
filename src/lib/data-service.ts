import type {
  HackathonListItem,
  HackathonDetail,
  LeaderboardData,
  LeaderboardEntry,
  TeamItem,
} from '@/types';

import hackathonsList from '@/data/hackathons.json';
import hackathonDetailsRaw from '@/data/hackathon-details.json';
import leaderboardRaw from '@/data/leaderboard.json';
import teamsRaw from '@/data/teams.json';
import { getLocalTeams } from '@/lib/storage';

// ─── Hackathon List ───
export function getHackathons(): HackathonListItem[] {
  return hackathonsList as HackathonListItem[];
}

export function getFeaturedHackathon(): HackathonListItem | undefined {
  return getHackathons().find((hackathon) => hackathon.slug === 'daker-handover-2026-03')
    ?? getHackathons().find((hackathon) => hackathon.status === 'upcoming')
    ?? getHackathons()[0];
}

// ─── Hackathon Detail ───
const detailRoot = hackathonDetailsRaw as unknown as HackathonDetail & { extraDetails?: HackathonDetail[] };
const allDetails: HackathonDetail[] = [
  { slug: detailRoot.slug, title: detailRoot.title, sections: detailRoot.sections },
  ...(detailRoot.extraDetails ?? []),
];

export function getHackathonDetail(slug: string): HackathonDetail | undefined {
  return allDetails.find((d) => d.slug === slug);
}

export function getAllHackathonDetails(): HackathonDetail[] {
  return allDetails;
}

// ─── Leaderboard ───
const lbRoot = leaderboardRaw as unknown as LeaderboardData;
const allLeaderboards: LeaderboardData[] = [
  { hackathonSlug: lbRoot.hackathonSlug, updatedAt: lbRoot.updatedAt, entries: lbRoot.entries },
  ...(lbRoot.extraLeaderboards ?? []),
];

export function getLeaderboard(slug: string): LeaderboardData | undefined {
  return allLeaderboards.find((lb) => lb.hackathonSlug === slug);
}

export function getAllLeaderboards(): LeaderboardData[] {
  return allLeaderboards;
}

export function getTopEntry(slug: string): LeaderboardEntry | undefined {
  return getLeaderboard(slug)?.entries?.[0];
}

// ─── Teams ───
export function getTeams(): TeamItem[] {
  return [...getLocalTeams(), ...(teamsRaw as TeamItem[])];
}

export function getTeamsByHackathon(slug: string): TeamItem[] {
  return getTeams().filter((t) => t.hackathonSlug === slug);
}

export function getOpenTeams(): TeamItem[] {
  return getTeams().filter((t) => t.isOpen);
}

// ─── Helpers ───
export function getHackathonTitle(slug: string): string {
  const list = getHackathons().find((h) => h.slug === slug);
  if (list) return list.title;
  const detail = getHackathonDetail(slug);
  return detail?.title ?? slug;
}
