'use client';

import { useState, useMemo } from 'react';
import { Users, Search, ExternalLink, ChevronDown, UserPlus, Filter } from 'lucide-react';
import teamsData from '@/data/teams.json';
import hackathonsData from '@/data/hackathons.json';
import { Team, Hackathon } from '@/types';
import { getBadgeColor, cn } from '@/lib/utils';

const teams = teamsData as Team[];
const hackathons = hackathonsData as Hackathon[];

export default function TeamsPage() {
  const [search, setSearch] = useState('');
  const [hackathonFilter, setHackathonFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('');

  const allRoles = useMemo(() => {
    const roles = new Set<string>();
    teams.forEach((t) => t.lookingFor.forEach((r) => roles.add(r)));
    return Array.from(roles);
  }, []);

  const filtered = useMemo(() => {
    let result = [...teams];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        t.intro.toLowerCase().includes(q) ||
        t.lookingFor.some((r) => r.toLowerCase().includes(q))
      );
    }
    if (hackathonFilter !== 'all') result = result.filter((t) => t.hackathonSlug === hackathonFilter);
    if (statusFilter === 'open') result = result.filter((t) => t.isOpen);
    if (statusFilter === 'closed') result = result.filter((t) => !t.isOpen);
    if (roleFilter) result = result.filter((t) => t.lookingFor.includes(roleFilter));
    return result;
  }, [search, hackathonFilter, statusFilter, roleFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Users className="text-purple-500" size={32} />
          팀 모집
        </h1>
        <p className="text-gray-500 dark:text-gray-400">함께 도전할 팀을 찾거나 새로운 팀을 만들어 보세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
        {[
          { label: '전체 팀', value: teams.length, color: 'text-blue-600' },
          { label: '모집중', value: teams.filter(t => t.isOpen).length, color: 'text-green-600' },
          { label: '총 인원', value: teams.reduce((s, t) => s + t.memberCount, 0), color: 'text-purple-600' },
          { label: '빈 자리', value: teams.reduce((s, t) => s + t.maxSize - t.memberCount, 0), color: 'text-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center">
            <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-3 animate-slide-up">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="팀 검색..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div className="relative">
            <select value={hackathonFilter} onChange={(e) => setHackathonFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm cursor-pointer outline-none">
              <option value="all">전체 해커톤</option>
              {hackathons.map((h) => (
                <option key={h.slug} value={h.slug}>{h.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={16} className="text-gray-400" />
          {(['all', 'open', 'closed'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1 rounded-full text-sm font-medium transition-all',
                statusFilter === s ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300')}>
              {s === 'all' ? '전체' : s === 'open' ? '모집중' : '모집완료'}
            </button>
          ))}
          <span className="text-gray-300 dark:text-gray-600">|</span>
          {allRoles.map((role) => (
            <button key={role} onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
              className={cn('px-3 py-1 rounded-full text-sm transition-all',
                roleFilter === role ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400')}>
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">{filtered.length}개의 팀</div>

      {/* Teams */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">검색 결과가 없습니다</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">다른 조건으로 검색해 보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((team, idx) => {
            const hackathon = hackathons.find((h) => h.slug === team.hackathonSlug);
            return (
              <div key={team.teamCode}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 card-hover animate-slide-up"
                style={{ animationDelay: `${idx * 0.03}s` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{team.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {hackathon?.title || team.hackathonSlug}
                    </p>
                  </div>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full shrink-0',
                    team.isOpen ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400')}>
                    {team.isOpen ? '모집중' : '마감'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{team.intro}</p>

                {team.lookingFor.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {team.lookingFor.map((role) => (
                        <span key={role} className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded font-medium">
                          <UserPlus size={10} /> {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Members */}
                <div className="flex items-center gap-1 mb-2">
                  {team.members.map((m) => (
                    <div key={m.nickname} className="group relative">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800">
                        {m.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 pointer-events-none">
                        <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          {m.nickname} · {m.role} · <span className={getBadgeColor(m.badge)}>{m.badge}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {team.memberCount < team.maxSize && (
                    <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center text-gray-400 text-xs">+</div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(team.memberCount / team.maxSize) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{team.memberCount}/{team.maxSize}</span>
                </div>

                {team.isOpen && (
                  <a href={team.contact.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    <ExternalLink size={14} /> 합류 문의
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
