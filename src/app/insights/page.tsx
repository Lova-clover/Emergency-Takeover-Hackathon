'use client';

import { useState } from 'react';
import {
  BarChart3, Users, Trophy, TrendingUp, Calendar, Award, Target,
  PieChart, Activity, Zap, ChevronDown,
} from 'lucide-react';
import hackathonsData from '@/data/hackathons.json';
import leaderboardData from '@/data/leaderboard.json';
import teamsData from '@/data/teams.json';
import { Hackathon, LeaderboardData, Team } from '@/types';
import { cn } from '@/lib/utils';

const hackathons = hackathonsData as Hackathon[];
const leaderboard = [leaderboardData] as LeaderboardData[];
const teams = teamsData as Team[];

// Derived stats
const totalParticipants = hackathons.reduce((sum, h) => sum + h.participantCount, 0);
const totalTeams = hackathons.length; // each hackathon represents teams
const totalSubmissions = hackathons.reduce((sum, h) => sum + h.submissionCount, 0);
const totalViews = hackathons.reduce((sum, h) => sum + h.views, 0);
const parseAmount = (s: string) => parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
const totalPrize = hackathons.reduce((sum, h) => sum + h.prizes.reduce((s, p) => s + parseAmount(p.amount), 0), 0);

// Leaderboard analytics
const allEntries = leaderboard.flatMap((lb) => lb.entries);
const avgScore = allEntries.length > 0 ? allEntries.reduce((s, e) => s + e.score, 0) / allEntries.length : 0;
const maxScore = allEntries.length > 0 ? Math.max(...allEntries.map((e) => e.score)) : 0;
const minScore = allEntries.length > 0 ? Math.min(...allEntries.map((e) => e.score)) : 0;

// Tag analytics
const tagCounts: Record<string, number> = {};
hackathons.forEach((h) => h.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
const maxTagCount = sortedTags.length > 0 ? sortedTags[0][1] : 1;

// Team role demand
const roleDemand: Record<string, number> = {};
teams.forEach((t) => t.lookingFor.forEach((r) => { roleDemand[r] = (roleDemand[r] || 0) + 1; }));
const sortedRoles = Object.entries(roleDemand).sort((a, b) => b[1] - a[1]);
const maxRoleCount = sortedRoles.length > 0 ? sortedRoles[0][1] : 1;

// Score distribution for bar chart
const scoreRanges = ['0-20', '20-40', '40-60', '60-80', '80-100'];
const scoreDist = scoreRanges.map((range) => {
  const [min, max] = range.split('-').map(Number);
  return allEntries.filter((e) => e.score >= min && e.score < max).length;
});
const maxDist = Math.max(...scoreDist, 1);

// Team status breakdown
const recruitingTeams = teams.filter((t) => t.isOpen && t.memberCount < t.maxSize).length;
const fullTeams = teams.filter((t) => t.memberCount >= t.maxSize).length;
const closedTeams = teams.filter((t) => !t.isOpen && t.memberCount < t.maxSize).length;
const teamStatusTotal = teams.length || 1;

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={cn('p-2.5 rounded-lg', color)}>{icon}</div>
      </div>
    </div>
  );
}

function BarChartSimple({ data, labels, maxVal, color }: {
  data: number[]; labels: string[]; maxVal: number; color: string;
}) {
  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((val, i) => (
        <div key={labels[i]} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-400 font-medium">{val}</span>
          <div className="w-full rounded-t-md transition-all duration-500 ease-out" style={{
            height: `${Math.max((val / maxVal) * 100, 4)}%`,
            backgroundColor: color,
            opacity: 0.7 + (val / maxVal) * 0.3,
          }} />
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBar({ label, value, maxVal, color }: {
  label: string; value: number; maxVal: number; color: string;
}) {
  const pct = (value / maxVal) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-400 w-24 truncate">{label}</span>
      <div className="flex-1 h-6 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2" style={{ width: `${pct}%`, backgroundColor: color }}>
          <span className="text-[10px] text-white font-bold">{value}</span>
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [activeSection, setActiveSection] = useState<'overview' | 'scores' | 'teams' | 'trends'>('overview');

  const sections = [
    { key: 'overview' as const, label: '전체 현황', icon: <BarChart3 size={16} /> },
    { key: 'scores' as const, label: '성적 분석', icon: <Trophy size={16} /> },
    { key: 'teams' as const, label: '팀 분석', icon: <Users size={16} /> },
    { key: 'trends' as const, label: '트렌드', icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BarChart3 className="text-purple-500" size={32} />
          인사이트
        </h1>
        <p className="text-gray-500 dark:text-gray-400">해커톤 데이터 분석 대시보드</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeSection === s.key
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
            )}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Calendar size={20} className="text-blue-600" />} label="총 해커톤" value={hackathons.length} sub="현재 등록된 대회" color="bg-blue-50 dark:bg-blue-900/30" />
            <StatCard icon={<Users size={20} className="text-green-600" />} label="총 참가자" value={totalParticipants} sub="모든 해커톤 합산" color="bg-green-50 dark:bg-green-900/30" />
            <StatCard icon={<Target size={20} className="text-orange-600" />} label="총 제출" value={totalSubmissions} sub="최종 제출물" color="bg-orange-50 dark:bg-orange-900/30" />
            <StatCard icon={<Award size={20} className="text-purple-600" />} label="총 상금" value={`₩${(totalPrize / 10000).toFixed(0)}만`} sub="모든 해커톤 합산" color="bg-purple-50 dark:bg-purple-900/30" />
          </div>

          {/* Hackathon cards */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity size={18} className="text-purple-500" /> 해커톤별 참여 현황</h3>
            <div className="space-y-4">
              {hackathons.map((h) => {
                const maxP = Math.max(...hackathons.map((hh) => hh.participantCount), 1);
                return (
                  <div key={h.slug} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate mr-2">{h.title}</span>
                      <span className="text-gray-500 whitespace-nowrap">{h.participantCount}명 / {h.submissionCount}건</span>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${(h.participantCount / maxP) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tag cloud */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap size={18} className="text-yellow-500" /> 인기 기술 태그</h3>
            <div className="flex flex-wrap gap-2">
              {sortedTags.map(([tag, count]) => {
                const intensity = count / maxTagCount;
                return (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-transform hover:scale-105"
                    style={{
                      backgroundColor: `rgba(99, 102, 241, ${0.1 + intensity * 0.3})`,
                      color: intensity > 0.5 ? '#4338ca' : '#6366f1',
                      fontSize: `${0.75 + intensity * 0.25}rem`,
                    }}
                  >
                    {tag} <span className="text-xs opacity-70">({count})</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Scores Section */}
      {activeSection === 'scores' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Trophy size={20} className="text-yellow-600" />} label="최고 점수" value={maxScore.toFixed(1)} color="bg-yellow-50 dark:bg-yellow-900/30" />
            <StatCard icon={<TrendingUp size={20} className="text-blue-600" />} label="평균 점수" value={avgScore.toFixed(1)} color="bg-blue-50 dark:bg-blue-900/30" />
            <StatCard icon={<ChevronDown size={20} className="text-red-600" />} label="최저 점수" value={minScore.toFixed(1)} color="bg-red-50 dark:bg-red-900/30" />
            <StatCard icon={<Activity size={20} className="text-green-600" />} label="점수 편차" value={(maxScore - minScore).toFixed(1)} color="bg-green-50 dark:bg-green-900/30" />
          </div>

          {/* Score Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><PieChart size={18} className="text-indigo-500" /> 점수 분포</h3>
            <BarChartSimple data={scoreDist} labels={scoreRanges} maxVal={maxDist} color="#6366f1" />
          </div>

          {/* Leaderboard by hackathon */}
          {leaderboard.map((lb) => (
            <div key={lb.hackathonSlug} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Trophy size={18} className="text-amber-500" /> {hackathons.find(h => h.slug === lb.hackathonSlug)?.title || lb.hackathonSlug} 순위</h3>
              <div className="space-y-3">
                {lb.entries.slice(0, 5).map((entry) => (
                  <div key={entry.teamName} className="flex items-center gap-3">
                    <span className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                      entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    )}>
                      {entry.rank}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{entry.teamName}</p>
                      <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                          style={{ width: `${(entry.score / maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teams Section */}
      {activeSection === 'teams' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users size={20} className="text-blue-600" />} label="전체 팀" value={teams.length} color="bg-blue-50 dark:bg-blue-900/30" />
            <StatCard icon={<Zap size={20} className="text-green-600" />} label="모집 중" value={recruitingTeams} sub={`${Math.round((recruitingTeams / teamStatusTotal) * 100)}%`} color="bg-green-50 dark:bg-green-900/30" />
            <StatCard icon={<Target size={20} className="text-purple-600" />} label="모집 완료" value={fullTeams} color="bg-purple-50 dark:bg-purple-900/30" />
            <StatCard icon={<Award size={20} className="text-gray-600" />} label="마감" value={closedTeams} color="bg-gray-50 dark:bg-gray-900/30" />
          </div>

          {/* Team status donut */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-lg mb-4">팀 상태 분포</h3>
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" className="dark:stroke-slate-700" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                      strokeDasharray={`${(recruitingTeams / teamStatusTotal) * 100} ${100 - (recruitingTeams / teamStatusTotal) * 100}`} strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3"
                      strokeDasharray={`${(fullTeams / teamStatusTotal) * 100} ${100 - (fullTeams / teamStatusTotal) * 100}`}
                      strokeDashoffset={`${-(recruitingTeams / teamStatusTotal) * 100}`} />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#9ca3af" strokeWidth="3"
                      strokeDasharray={`${(closedTeams / teamStatusTotal) * 100} ${100 - (closedTeams / teamStatusTotal) * 100}`}
                      strokeDashoffset={`${-((recruitingTeams + fullTeams) / teamStatusTotal) * 100}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{teams.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-sm">모집 중 ({recruitingTeams})</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /><span className="text-sm">모집 완료 ({fullTeams})</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400" /><span className="text-sm">마감 ({closedTeams})</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-lg mb-4">모집 역할 수요</h3>
              <div className="space-y-3">
                {sortedRoles.map(([role, count]) => (
                  <HorizontalBar key={role} label={role} value={count} maxVal={maxRoleCount} color="#8b5cf6" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Section */}
      {activeSection === 'trends' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><TrendingUp size={18} className="text-green-500" /> 해커톤 참여 트렌드</h3>
            <p className="text-sm text-gray-500 mb-6">해커톤별 참가자 수 및 제출률 비교</p>
            <div className="space-y-6">
              {hackathons.map((h) => {
                const submissionRate = h.participantCount > 0 ? (h.submissionCount / h.participantCount) * 100 : 0;
                return (
                  <div key={h.slug} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{h.title}</span>
                      <span className="text-gray-500">제출률 {submissionRate.toFixed(0)}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>참가자</span><span>{h.participantCount}</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(h.participantCount / totalParticipants) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>제출</span><span>{h.submissionCount}</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${submissionRate}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prize comparison */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Award size={18} className="text-amber-500" /> 해커톤별 상금 규모</h3>
            <div className="space-y-3">
              {hackathons.map((h) => {
                const prize = h.prizes.reduce((s, p) => s + parseAmount(p.amount), 0);
                const maxPrize = Math.max(...hackathons.map((hh) => hh.prizes.reduce((s, p) => s + parseAmount(p.amount), 0)), 1);
                return (
                  <HorizontalBar key={h.slug} label={h.title.slice(0, 15)} value={prize / 10000} maxVal={maxPrize / 10000} color="#f59e0b" />
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">단위: 만원</p>
          </div>

          {/* Competitiveness index */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Target size={18} className="text-red-500" /> 경쟁률 지표</h3>
            <p className="text-sm text-gray-500 mb-4">참가자 대비 팀 수 비율로 본 경쟁 강도</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hackathons.map((h) => {
                const teamsForHackathon = teams.filter(t => t.hackathonSlug === h.slug).length || 1;
                const competitiveness = (h.participantCount / teamsForHackathon).toFixed(1);
                return (
                  <div key={h.slug} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                    <p className="text-3xl font-bold text-red-500">{competitiveness}</p>
                    <p className="text-xs text-gray-500 mt-1">명/팀</p>
                    <p className="text-sm font-medium mt-2 truncate">{h.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
