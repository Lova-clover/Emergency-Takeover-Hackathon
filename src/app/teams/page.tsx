"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { Search, Users, LogIn, Loader2, ShieldCheck, Swords, Ghost, TerminalSquare, Plus, X } from "lucide-react";
import Link from "next/link";
import { getTeams } from "@/lib/data-service";
import { getHackathons } from "@/lib/data-service";
import { saveLocalTeam } from "@/lib/storage";
import type { TeamItem } from "@/types";

const ROLE_OPTIONS = ["프론트엔드", "백엔드", "디자인", "PM", "AI/ML", "데이터", "DevOps", "기획"];

export default function TeamsPage() {
  const allTeams = useMemo(() => getTeams(), []);
  const hackathons = useMemo(() => getHackathons(), []);
  const [teams, setTeams] = useState<TeamItem[]>(allTeams);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "recruiting" | "full">("all");
  const [showCreate, setShowCreate] = useState(false);
  const { myTeamId, joinTeam, leaveTeam, isHydrated } = useUser();

  // Create team form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState(hackathons[0]?.slug ?? "");
  const [formIntro, setFormIntro] = useState("");
  const [formLookingFor, setFormLookingFor] = useState<string[]>([]);
  const [formContact, setFormContact] = useState("");

  const refreshTeams = () => setTeams(getTeams());

  const filteredTeams = teams.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      t.lookingFor.some((r) => r.toLowerCase().includes(q));
    const matchesFilter =
      filter === "all" ? true : filter === "recruiting" ? t.isOpen === true : t.isOpen === false;
    return matchesSearch && matchesFilter;
  });

  const handleCreateTeam = () => {
    if (!formName.trim()) return;
    saveLocalTeam({
      name: formName.trim(),
      hackathonSlug: formSlug,
      isOpen: true,
      memberCount: 1,
      maxSize: 5,
      lookingFor: formLookingFor,
      intro: formIntro.trim(),
      contact: { type: "url", url: formContact.trim() },
    });
    setFormName("");
    setFormIntro("");
    setFormLookingFor([]);
    setFormContact("");
    setShowCreate(false);
    refreshTeams();
  };

  const toggleRole = (role: string) => {
    setFormLookingFor((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  if (!isHydrated) return null;

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background font-bold text-xs rounded-full mb-6 shadow-sm uppercase tracking-wider">
          <Swords className="w-4 h-4" /> Team Building Task
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 font-heading text-foreground">
          작전팀 결성 <span className="text-muted-foreground">목록</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl">
          가용한 개발자들을 모아 팀을 구성하세요. 우승을 위한 긴급 편입.
        </p>
      </motion.div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between bg-surface/80 backdrop-blur-md p-2 rounded-3xl border shadow-sm top-20 z-10 sticky">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground font-bold" />
          <input
            type="text"
            placeholder="팀 이름 또는 역할로 검색.."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border rounded-full py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-foreground/20 transition-all text-sm font-bold placeholder:font-normal"
          />
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-bold hover:scale-105 transition-transform shadow-sm"
          >
            <Plus className="w-4 h-4" /> 팀 만들기
          </button>
          <div className="flex gap-2 p-1 bg-background rounded-full border">
            {(["all", "recruiting", "full"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all capitalize relative ${
                  filter === f ? "text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter === f && (
                  <motion.div layoutId="team-filter" className="absolute inset-0 bg-foreground rounded-full -z-10 shadow-sm" />
                )}
                {f === "all" ? "전체" : f === "recruiting" ? "모집중" : "마감"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Team Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-10"
          >
            <div className="bg-surface border rounded-[2rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black font-heading">팀 만들기</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold mb-2">팀 이름 <span className="text-red-500">*</span></label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="예: 긴급출동 A팀"
                    className="w-full bg-background border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-foreground/20 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">해커톤</label>
                  <select
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full bg-background border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-foreground/20 text-sm font-medium"
                  >
                    {hackathons.map((h) => (
                      <option key={h.slug} value={h.slug}>{h.title}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">팀 소개</label>
                  <textarea
                    value={formIntro}
                    onChange={(e) => setFormIntro(e.target.value)}
                    placeholder="팀의 목표와 방향을 간단히 소개해주세요"
                    rows={3}
                    className="w-full bg-background border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-foreground/20 text-sm font-medium resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">찾는 역할</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_OPTIONS.map((role) => (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                          formLookingFor.includes(role)
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background text-muted-foreground hover:border-foreground/30"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">연락처 URL</label>
                  <input
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="https://open.kakao.com/..."
                    className="w-full bg-background border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-foreground/20 text-sm font-medium"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateTeam}
                disabled={!formName.trim()}
                className="mt-6 px-8 py-3 bg-foreground text-background rounded-full font-bold hover:scale-105 transition-transform shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                팀 생성하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTeams.map((team, idx) => {
            const isMyTeam = team.teamCode === myTeamId;
            const isFull = !team.isOpen;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                key={team.teamCode}
                className={`group relative bg-surface border rounded-[2rem] p-7 flex flex-col hover:border-foreground/30 transition-all shadow-sm hover:shadow-md ${
                  isMyTeam ? "ring-2 ring-foreground" : ""
                }`}
              >
                {isMyTeam && (
                  <div className="absolute -top-3 left-6 bg-foreground text-background text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> 내 소속 팀
                  </div>
                )}

                <div className="flex justify-between items-start mb-6 mt-2">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 border flex items-center justify-center font-black font-heading text-2xl group-hover:bg-foreground group-hover:text-background transition-colors">
                    {team.name.substring(0, 1)}
                  </div>
                  {team.isOpen ? (
                    <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      모집중
                    </span>
                  ) : (
                    <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1">
                      마감됨
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black mb-2 text-foreground font-heading tracking-tight">{team.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-medium leading-relaxed flex-1">
                  {team.intro || "해커톤 우승을 위해 전진하는 정예 팀입니다"}
                </p>

                <div className="space-y-4">
                  {/* Hackathon slug badge */}
                  <Link href={`/hackathons/${team.hackathonSlug}`} className="inline-block">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-foreground/10 border rounded-full text-foreground hover:bg-foreground/20 transition-colors">
                      🏆 {team.hackathonSlug}
                    </span>
                  </Link>

                  {/* Looking for roles */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {team.lookingFor.slice(0, 3).map((role, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-1 bg-background border rounded-md text-foreground group-hover:border-foreground/20 transition-colors">
                        #{role}
                      </span>
                    ))}
                    {team.lookingFor.length > 3 && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-muted rounded-md text-muted-foreground">
                        +{team.lookingFor.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Member count */}
                  <div className="flex items-center justify-between py-4 border-t border-b border-muted">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground">
                        {team.memberCount} / {team.maxSize || 5}명 참여
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {isMyTeam ? (
                      <button
                        onClick={() => leaveTeam()}
                        className="w-full py-4 rounded-xl bg-background border-2 border-foreground/10 text-foreground font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Ghost className="w-4 h-4" /> 팀 탈퇴하기
                      </button>
                    ) : (
                      <button
                        onClick={() => joinTeam(team.teamCode)}
                        disabled={isFull || !!myTeamId}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          isFull
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : !!myTeamId
                            ? "bg-muted text-muted-foreground cursor-not-allowed border"
                            : "bg-foreground text-background hover:scale-[1.02] shadow-xl shadow-foreground/10 active:scale-95"
                        }`}
                      >
                        {!!myTeamId ? "이미 소속된 팀이 있습니다" : isFull ? "모집이 마감되었습니다" : "합류 지원하기"}
                        {!isFull && !myTeamId && <LogIn className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTeams.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] bg-surface/50 mt-10">
            <div className="w-20 h-20 bg-background border flex items-center justify-center rounded-[2rem] mx-auto mb-6 rotate-12">
              <TerminalSquare className="w-10 h-10 text-muted-foreground -rotate-12" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-foreground">발견된 작전팀이 없습니다</h3>
            <p className="text-muted-foreground font-medium">검색 조건이나 필터를 변경해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
