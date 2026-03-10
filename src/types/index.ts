export interface Hackathon {
  slug: string;
  title: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  tags: string[];
  thumbnailUrl: string;
  period: {
    timezone: string;
    registrationStart: string;
    registrationDeadline: string;
    competitionStart: string;
    competitionEnd: string;
  };
  overview: {
    summary: string;
    description: string;
    goals: string[];
    tech: { tools: string; deployment: string };
    teamPolicy: { allowSolo: boolean; minSize: number; maxSize: number };
  };
  schedule: ScheduleItem[];
  prizes: Prize[];
  evaluation: {
    rounds: EvaluationRound[];
  };
  rules: {
    submissions: string[];
    development: string[];
    fairness: string[];
  };
  participantCount: number;
  submissionCount: number;
  views: number;
  organizer: { name: string; contact: string };
}

export interface ScheduleItem {
  name: string;
  date: string;
  status: 'ongoing' | 'upcoming' | 'ended';
}

export interface Prize {
  place: string;
  label: string;
  amount: string;
}

export interface EvaluationRound {
  name: string;
  description: string;
  weights?: { participant: number; judge: number };
  criteria?: EvaluationCriteria[];
}

export interface EvaluationCriteria {
  name: string;
  points: number;
  details: string;
}

export interface LeaderboardData {
  hackathonSlug: string;
  updatedAt: string;
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  score: number;
  submittedAt: string;
  scoreBreakdown: { participant: number; judge: number };
  artifacts: { webUrl: string; planTitle: string };
}

export interface Team {
  teamCode: string;
  hackathonSlug: string;
  name: string;
  isOpen: boolean;
  memberCount: number;
  maxSize: number;
  lookingFor: string[];
  intro: string;
  contact: { type: string; url: string };
  createdAt: string;
  members: TeamMember[];
}

export interface TeamMember {
  nickname: string;
  role: string;
  badge: string;
}

export interface Bookmark {
  slug: string;
  addedAt: string;
}
