'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Trophy, Users, FileText, Clock, Star, StarOff, ExternalLink, CheckCircle, AlertCircle, ChevronRight, Award, Target, Shield, BookOpen } from 'lucide-react';
import hackathonsData from '@/data/hackathons.json';
import leaderboardData from '@/data/leaderboard.json';
import teamsData from '@/data/teams.json';
import { Hackathon, LeaderboardData, Team } from '@/types';
import { getStatusColor, getStatusLabel, getDaysLeft, getBadgeColor, cn } from '@/lib/utils';
import { isBookmarked, addBookmark, removeBookmark } from '@/lib/storage';

const hackathons = hackathonsData as Hackathon[];
const leaderboard = leaderboardData as LeaderboardData;
const teams = teamsData as Team[];

type Tab = 'overview' | 'schedule' | 'prizes' | 'evaluation' | 'rules' | 'leaderboard' | 'teams';

export default function HackathonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [bookmarked, setBookmarked] = useState(false);

  const hackathon = hackathons.find((h) => h.slug === slug);
  const hackathonTeams = teams.filter((t) => t.hackathonSlug === slug);
  const hackathonLeaderboard =
    leaderboard.hackathonSlug === slug ? leaderboard : null;

  useEffect(() => {
    setBookmarked(isBookmarked(slug));
  }, [slug]);

  const handleBookmark = () => {
    if (bookmarked) { removeBookmark(slug); setBookmarked(false); }
    else { addBookmark(slug); setBookmarked(true); }
  };

  if (!hackathon) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold mb-2">해커톤을 찾을 수 없습니다</h2>
        <p className="text-gray-500 mb-6">요청한 해커톤이 존재하지 않습니다.</p>
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft size={16} /> 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: '개요', icon: BookOpen },
    { key: 'schedule', label: '일정', icon: Calendar },
    { key: 'prizes', label: '상금', icon: Trophy },
    { key: 'evaluation', label: '평가', icon: Target },
    { key: 'rules', label: '규칙', icon: Shield },
    { key: 'leaderboard', label: '리더보드', icon: Award },
    { key: 'teams', label: '팀 모집', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 animate-fade-in">
        <Link href="/" className="hover:text-blue-600 transition-colors">해커톤</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{hackathon.title}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-8 animate-slide-up">
        <div className="h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(hackathon.status))}>
                  {getStatusLabel(hackathon.status)}
                </span>
                {hackathon.status === 'ongoing' && (
                  <span className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 font-medium">
                    <Clock size={14} /> {getDaysLeft(hackathon.period.registrationDeadline)}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{hackathon.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{hackathon.overview.summary}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {hackathon.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Users size={14} /> {hackathon.participantCount}명 참가</span>
                <span className="flex items-center gap-1"><FileText size={14} /> {hackathon.submissionCount}개 제출</span>
                <span>주최: {hackathon.organizer.name}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleBookmark}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm">
                {bookmarked ? <Star size={16} className="text-yellow-500 fill-yellow-500" /> : <StarOff size={16} />}
                {bookmarked ? '저장됨' : '저장'}
              </button>
              <button className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                참가 신청
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-8 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn('flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300')}>
                <Icon size={16} />{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && <OverviewTab hackathon={hackathon} />}
        {activeTab === 'schedule' && <ScheduleTab hackathon={hackathon} />}
        {activeTab === 'prizes' && <PrizesTab hackathon={hackathon} />}
        {activeTab === 'evaluation' && <EvaluationTab hackathon={hackathon} />}
        {activeTab === 'rules' && <RulesTab hackathon={hackathon} />}
        {activeTab === 'leaderboard' && <LeaderboardTab data={hackathonLeaderboard} />}
        {activeTab === 'teams' && <TeamsTab teams={hackathonTeams} />}
      </div>
    </div>
  );
}

function OverviewTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen size={20} /> 대회 소개</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{hackathon.overview.description}</p>
          <h4 className="font-semibold mb-2">목표</h4>
          <ul className="space-y-2">
            {hackathon.overview.goals.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />{g}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold mb-4">기술 / 환경</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">개발 도구</p>
              <p className="font-medium">{hackathon.overview.tech.tools}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">배포</p>
              <p className="font-medium">{hackathon.overview.tech.deployment}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="font-bold mb-4">주요 정보</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">참가 인원</span><span className="font-medium">{hackathon.participantCount}명</span></div>
            <div className="flex justify-between"><span className="text-gray-500">팀 규모</span><span className="font-medium">{hackathon.overview.teamPolicy.minSize}~{hackathon.overview.teamPolicy.maxSize}명</span></div>
            <div className="flex justify-between"><span className="text-gray-500">개인 참가</span><span className="font-medium">{hackathon.overview.teamPolicy.allowSolo ? '가능' : '불가'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">제출 수</span><span className="font-medium">{hackathon.submissionCount}건</span></div>
            <div className="flex justify-between"><span className="text-gray-500">조회 수</span><span className="font-medium">{hackathon.views.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50 p-6">
          <h3 className="font-bold mb-3">🏆 상금</h3>
          {hackathon.prizes.map((p) => (
            <div key={p.place} className="flex justify-between items-center py-1.5">
              <span>{p.label}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{p.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="max-w-3xl">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Calendar size={20} /> 대회 일정</h3>
        <div className="relative">
          {hackathon.schedule.map((item, idx) => (
            <div key={idx} className="flex gap-4 mb-6 last:mb-0">
              <div className="flex flex-col items-center">
                <div className={cn('w-4 h-4 rounded-full border-2 shrink-0',
                  item.status === 'ended' ? 'bg-green-500 border-green-500' :
                  item.status === 'ongoing' ? 'bg-blue-500 border-blue-500 animate-pulse' :
                  'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600')} />
                {idx < hackathon.schedule.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-slate-700 mt-1" />}
              </div>
              <div className="pb-4">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
                <span className={cn('inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium', getStatusColor(item.status))}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrizesTab({ hackathon }: { hackathon: Hackathon }) {
  const medalColors = ['from-yellow-400 to-amber-500', 'from-gray-300 to-gray-400', 'from-orange-400 to-amber-600'];
  return (
    <div className="max-w-2xl">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Trophy size={20} className="text-yellow-500" /> 수상자 혜택</h3>
        <div className="space-y-4">
          {hackathon.prizes.map((prize, idx) => (
            <div key={prize.place} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600">
              <div className={cn('w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-lg', medalColors[idx] || 'from-gray-400 to-gray-500')}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{prize.label}</p>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{prize.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvaluationTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="space-y-6 max-w-4xl">
      {hackathon.evaluation.rounds.map((round, ri) => (
        <div key={ri} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold mb-2">{round.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{round.description}</p>
          {round.weights && (
            <div className="flex gap-4 mb-4">
              <div className="flex-1 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-2xl font-bold text-blue-600">{round.weights.participant}%</p>
                <p className="text-sm text-gray-500">참가자 투표</p>
              </div>
              <div className="flex-1 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                <p className="text-2xl font-bold text-purple-600">{round.weights.judge}%</p>
                <p className="text-sm text-gray-500">심사위원 투표</p>
              </div>
            </div>
          )}
          {round.criteria && round.criteria.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">평가 항목</h4>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">
                    <th className="pb-2 font-medium">평가항목</th>
                    <th className="pb-2 font-medium w-20 text-center">배점</th>
                    <th className="pb-2 font-medium">평가 포인트</th>
                  </tr>
                </thead>
                <tbody>
                  {round.criteria.map((c, ci) => (
                    <tr key={ci} className="border-b border-gray-100 dark:border-slate-700/50 last:border-b-0">
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm">
                          {c.points}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{c.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RulesTab({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="space-y-6 max-w-3xl">
      {[
        { title: '제출물', icon: FileText, items: hackathon.rules.submissions },
        { title: '개발/배포 규칙', icon: Shield, items: hackathon.rules.development },
        { title: '공정성/저작권', icon: AlertCircle, items: hackathon.rules.fairness },
      ].map((section) => (
        <div key={section.title} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <section.icon size={20} /> {section.title}
          </h3>
          <ul className="space-y-3">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function LeaderboardTab({ data }: { data: LeaderboardData | null }) {
  if (!data || data.entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">아직 리더보드 데이터가 없습니다</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">투표 평가 후 순위가 공개됩니다</p>
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-bold flex items-center gap-2"><Award size={20} /> 리더보드</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">업데이트: {new Date(data.updatedAt).toLocaleDateString('ko-KR')}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50">
              <th className="px-6 py-3 font-medium w-16">순위</th>
              <th className="px-6 py-3 font-medium">팀명</th>
              <th className="px-6 py-3 font-medium text-center">참가자 점수</th>
              <th className="px-6 py-3 font-medium text-center">심사위원 점수</th>
              <th className="px-6 py-3 font-medium text-center">최종 점수</th>
              <th className="px-6 py-3 font-medium">제출물</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry) => (
              <tr key={entry.rank} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-lg">{entry.rank <= 3 ? medals[entry.rank - 1] : entry.rank}</span>
                </td>
                <td className="px-6 py-4 font-semibold">{entry.teamName}</td>
                <td className="px-6 py-4 text-center">{entry.scoreBreakdown.participant}</td>
                <td className="px-6 py-4 text-center">{entry.scoreBreakdown.judge}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-bold">
                    {entry.score}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a href={entry.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <ExternalLink size={14} /> 웹사이트
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamsTab({ teams }: { teams: Team[] }) {
  const [filterOpen, setFilterOpen] = useState<'all' | 'open' | 'closed'>('all');
  const filtered = filterOpen === 'all' ? teams : teams.filter((t) => filterOpen === 'open' ? t.isOpen : !t.isOpen);

  if (teams.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">등록된 팀이 없습니다</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">첫 번째 팀을 만들어 보세요!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {(['all', 'open', 'closed'] as const).map((f) => (
          <button key={f} onClick={() => setFilterOpen(f)}
            className={cn('px-3 py-1 rounded-full text-sm font-medium transition-all',
              filterOpen === f ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300')}>
            {f === 'all' ? `전체 (${teams.length})` : f === 'open' ? `모집중 (${teams.filter(t => t.isOpen).length})` : `모집완료 (${teams.filter(t => !t.isOpen).length})`}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((team) => (
          <div key={team.teamCode} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-lg">{team.name}</h4>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', team.isOpen ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400')}>
                  {team.isOpen ? '모집중' : '모집완료'}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{team.memberCount}/{team.maxSize}명</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{team.intro}</p>
            {team.lookingFor.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">구인 포지션</p>
                <div className="flex flex-wrap gap-1">
                  {team.lookingFor.map((role) => (
                    <span key={role} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded font-medium">{role}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Member badges */}
            <div className="flex items-center gap-1 mb-3">
              {team.members.map((m) => (
                <div key={m.nickname} className="group relative">
                  <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800')}>
                    {m.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                    <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {m.nickname} · {m.role} · <span className={getBadgeColor(m.badge)}>{m.badge}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Member count bar */}
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(team.memberCount / team.maxSize) * 100}%` }} />
            </div>
            {team.isOpen && (
              <a href={team.contact.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                <ExternalLink size={14} /> 팀 합류 문의
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
