'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, ExternalLink, TrendingUp, Medal, ChevronDown } from 'lucide-react';
import leaderboardData from '@/data/leaderboard.json';
import hackathonsData from '@/data/hackathons.json';
import { LeaderboardData, Hackathon } from '@/types';
import { cn } from '@/lib/utils';

const leaderboard = leaderboardData as LeaderboardData;
const hackathons = hackathonsData as Hackathon[];

export default function LeaderboardPage() {
  const [selectedHackathon, setSelectedHackathon] = useState(leaderboard.hackathonSlug);
  const hackathon = hackathons.find((h) => h.slug === selectedHackathon);
  const data = leaderboard.hackathonSlug === selectedHackathon ? leaderboard : null;
  const medals = ['🥇', '🥈', '🥉'];
  const rankColors = [
    'from-yellow-500/10 to-amber-500/10 border-yellow-300 dark:border-yellow-700',
    'from-gray-300/10 to-gray-400/10 border-gray-300 dark:border-gray-600',
    'from-orange-400/10 to-amber-500/10 border-orange-300 dark:border-orange-700',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Award className="text-yellow-500" size={32} />
          리더보드
        </h1>
        <p className="text-gray-500 dark:text-gray-400">해커톤 참가팀의 순위와 점수를 확인하세요</p>
      </div>

      {/* Hackathon Selector */}
      <div className="mb-8 animate-slide-up">
        <div className="relative inline-block">
          <select
            value={selectedHackathon}
            onChange={(e) => setSelectedHackathon(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
          >
            {hackathons.map((h) => (
              <option key={h.slug} value={h.slug}>{h.title}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {!data || data.entries.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">리더보드 데이터가 없습니다</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">이 해커톤의 리더보드는 아직 공개되지 않았습니다</p>
        </div>
      ) : (
        <>
          {/* Top 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up">
            {data.entries.slice(0, 3).map((entry, idx) => (
              <div key={entry.rank}
                className={cn('bg-gradient-to-br rounded-xl border-2 p-6 text-center card-hover',
                  rankColors[idx] || 'border-gray-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-800')}
              >
                <div className="text-4xl mb-2">{medals[idx]}</div>
                <h3 className="text-xl font-bold mb-1">{entry.teamName}</h3>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">{entry.score}</div>
                <div className="flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <p className="text-xs">참가자</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{entry.scoreBreakdown.participant}</p>
                  </div>
                  <div>
                    <p className="text-xs">심사위원</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{entry.scoreBreakdown.judge}</p>
                  </div>
                </div>
                <a href={entry.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  <ExternalLink size={14} /> 웹사이트 보기
                </a>
              </div>
            ))}
          </div>

          {/* Full Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><TrendingUp size={18} /> 전체 순위</h3>
              <span className="text-xs text-gray-500">업데이트: {new Date(data.updatedAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50">
                    <th className="px-6 py-3 font-medium w-16">#</th>
                    <th className="px-6 py-3 font-medium">팀명</th>
                    <th className="px-6 py-3 font-medium text-center">참가자</th>
                    <th className="px-6 py-3 font-medium text-center">심사위원</th>
                    <th className="px-6 py-3 font-medium text-center">최종 점수</th>
                    <th className="px-6 py-3 font-medium">제출일</th>
                    <th className="px-6 py-3 font-medium">링크</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry) => (
                    <tr key={entry.rank} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-lg">
                        {entry.rank <= 3 ? medals[entry.rank - 1] : <span className="text-gray-500">{entry.rank}</span>}
                      </td>
                      <td className="px-6 py-4 font-semibold">{entry.teamName}</td>
                      <td className="px-6 py-4 text-center">{entry.scoreBreakdown.participant}</td>
                      <td className="px-6 py-4 text-center">{entry.scoreBreakdown.judge}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-bold text-sm">
                          {entry.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(entry.submittedAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <a href={entry.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                          <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Score Distribution Chart */}
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 animate-slide-up">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Medal size={18} /> 점수 분포</h3>
            <div className="flex items-end gap-3 h-40">
              {data.entries.map((entry) => {
                const height = (entry.score / 100) * 100;
                return (
                  <div key={entry.rank} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{entry.score}</span>
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-md transition-all duration-700"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-500 truncate max-w-full">{entry.teamName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
