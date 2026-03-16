"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import {
  Sparkles, TerminalSquare, Rocket, Users, Target, Activity,
  Send, CheckCircle2, AlertCircle, GitCommit, GitPullRequest,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { TeamItem } from "@/types";
import { getTeams, getHackathonDetail } from "@/lib/data-service";
import { getLatestSubmissionDraft, getSubmissionDrafts } from "@/lib/storage";
import { useCountdown } from "@/hooks/useCountdown";
import SubmissionStudio from "@/components/SubmissionStudio";

function CountdownWidget({ deadline }: { deadline: string }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(deadline);
  const readiness = isExpired ? 100 : Math.min(99, Math.round((1 - (new Date(deadline).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)) * 100));
  const pct = Math.max(0, Math.min(100, readiness));

  return (
    <div className="bg-foreground text-background rounded-[2rem] p-8 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-background/20 rounded-full blur-2xl group-hover:bg-background/30 transition-colors" />
      <div className="relative z-10">
        <h3 className="text-sm font-bold text-background/60 mb-2 uppercase tracking-tight">제출 마감까지 남은 시간</h3>
        <div className="text-4xl font-black font-heading tracking-tighter mb-8">
          {isExpired ? "마감" : `${days}일 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-background/70 mb-1">
            <span>진행률(추정)</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full bg-background/20 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-background rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampPage() {
  const { myTeamId, isHydrated } = useUser();
  const [activeTab, setActiveTab] = useState("dashboard");

  const team: TeamItem | null = useMemo(() => {
    if (!myTeamId) return null;
    return getTeams().find((t) => t.teamCode === myTeamId) ?? null;
  }, [myTeamId]);

  const hackathonDetail = useMemo(() => {
    if (!team) return undefined;
    return getHackathonDetail(team.hackathonSlug);
  }, [team]);

  const deadline = hackathonDetail?.sections.schedule.milestones.find(
    (m) => m.name.includes("마감") || m.name.toLowerCase().includes("deadline")
  )?.at ?? hackathonDetail?.sections.schedule.milestones.at(-1)?.at ?? "";

  const latestDraft = useMemo(() => {
    if (!team) return undefined;
    return getLatestSubmissionDraft(team.hackathonSlug);
  }, [team]);

  const allDrafts = useMemo(() => {
    if (!team) return [];
    return getSubmissionDrafts(team.hackathonSlug);
  }, [team]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!myTeamId || !team) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg">
          <div className="w-24 h-24 bg-surface border rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
            <TerminalSquare className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-black font-heading tracking-tight mb-4 text-foreground">접근 권한이 없습니다</h1>
          <p className="text-muted-foreground mb-10 text-lg">
            작전실(Operation Room)은 작전팀에 소속된 경우만 입장할 수 있는 기밀 작업 공간입니다. 팀에 합류하거나 창설해주세요.
          </p>
          <Link href="/teams">
            <button className="bg-foreground text-background px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-foreground/20 flex items-center gap-2 mx-auto">
              작전팀 탐색하러 가기 <Rocket className="w-5 h-5 ml-1" />
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "현황판", icon: Activity },
    { id: "members", label: "대원 명부", icon: Users },
    { id: "submit", label: "최종 제출", icon: Send },
  ];

  const submitSection = hackathonDetail?.sections.submit;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background font-bold rounded-full text-sm mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 text-yellow-400" /> DAKER OPERATION ROOM
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3 font-heading text-foreground">
          {team.name} <span className="text-muted-foreground">작전실</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl">
          코드와 창작이 결합되어 준비되는 공간. 남은 시간동안 멋진 결과를 달성하세요.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-surface/50 backdrop-blur-md p-1.5 rounded-full border shadow-sm inline-flex w-full md:w-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap relative ${
                isActive ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div layoutId="camp-tab" className="absolute inset-0 bg-foreground rounded-full shadow-sm -z-10" />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                {/* Team Info Card */}
                <div className="bg-surface rounded-[2rem] p-8 border hover:border-foreground/20 transition-all shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                    <Activity className="w-5 h-5 text-muted-foreground" /> 팀 정보
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-background rounded-2xl p-5 border">
                      <h4 className="text-sm text-muted-foreground mb-1">해커톤</h4>
                      <Link href={`/hackathons/${team.hackathonSlug}`} className="font-bold text-foreground hover:underline flex items-center gap-1">
                        {hackathonDetail?.title ?? team.hackathonSlug}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="bg-background rounded-2xl p-5 border">
                      <h4 className="text-sm text-muted-foreground mb-1">팀 규모</h4>
                      <p className="font-bold text-foreground">{team.memberCount} / {team.maxSize || 5}명</p>
                    </div>
                    <div className="bg-background rounded-2xl p-5 border">
                      <h4 className="text-sm text-muted-foreground mb-1">모집 상태</h4>
                      {team.isOpen ? (
                        <span className="inline-flex items-center gap-1 font-bold text-green-600">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> 모집중
                        </span>
                      ) : (
                        <span className="font-bold text-muted-foreground">마감됨</span>
                      )}
                    </div>
                    <div className="bg-background rounded-2xl p-5 border">
                      <h4 className="text-sm text-muted-foreground mb-1">연락처</h4>
                      {team.contact?.url ? (
                        <a href={team.contact.url} target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:underline flex items-center gap-1 truncate">
                          {team.contact.url} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">없음</span>
                      )}
                    </div>
                  </div>

                  {/* Integration cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-background rounded-2xl p-5 border group cursor-pointer hover:border-foreground/30 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center">
                          <GitPullRequest className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-md">11 Commits</span>
                      </div>
                      <h4 className="font-bold mb-1">Github Repository</h4>
                      <p className="text-sm text-muted-foreground truncate">Emergency-Takeover-Feat</p>
                    </div>
                    <div className="bg-background rounded-2xl p-5 border group cursor-pointer hover:border-foreground/30 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <div className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black rounded-xl flex items-center justify-center">
                          <svg viewBox="0 0 1155 1000" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M577.344 0L1154.69 1000H0L577.344 0Z" />
                          </svg>
                        </div>
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-md">Deployed</span>
                      </div>
                      <h4 className="font-bold mb-1">Vercel Deployment</h4>
                      <p className="text-sm text-muted-foreground truncate">daker-hackathon.vercel.app</p>
                    </div>
                  </div>

                  <div className="bg-background border rounded-2xl p-1 overflow-hidden">
                    <div className="px-4 py-3 bg-muted/50 border-b flex justify-between items-center">
                      <span className="text-sm font-bold">최근 커밋 기록</span>
                    </div>
                    <div className="divide-y">
                      {[
                        { msg: "feat: Add Framer Motion UI", time: "10 min ago", author: "Team Leader" },
                        { msg: "fix: Overhaul Data Context bug", time: "1 hour ago", author: "FrontEnd Core" },
                        { msg: "chore: Empty State handling", time: "3 hours ago", author: "UX Designer" },
                      ].map((commit, i) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <GitCommit className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-bold text-foreground">{commit.msg}</p>
                              <p className="text-xs text-muted-foreground">by {commit.author}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{commit.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mission & Roles */}
                <div className="bg-surface rounded-3xl p-8 border shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-muted-foreground" /> 작전 목표 및 아이디어
                  </h3>
                  <div className="prose dark:prose-invert">
                    <p className="text-lg leading-relaxed text-muted-foreground mb-6 font-medium">
                      {team.intro || "완벽한 제출물을 위해 나아갑니다. 팀원들과 목표를 조율하고 태스크를 나눠보세요."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {team.lookingFor.map((role) => (
                        <span key={role} className="px-3 py-1.5 bg-background border rounded-full text-sm font-bold text-foreground">
                          #{role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submission status */}
                {latestDraft && (
                  <div className="bg-surface rounded-3xl p-8 border shadow-sm">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground" /> 제출 현황
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-background rounded-2xl p-4 border text-center">
                        <p className="text-xs text-muted-foreground mb-1">상태</p>
                        <p className="font-bold text-foreground">{latestDraft.status === "submitted" ? "제출 완료" : "초안 작업 중"}</p>
                      </div>
                      <div className="bg-background rounded-2xl p-4 border text-center">
                        <p className="text-xs text-muted-foreground mb-1">완성도</p>
                        <p className="font-bold text-foreground">{latestDraft.readiness}%</p>
                      </div>
                      <div className="bg-background rounded-2xl p-4 border text-center">
                        <p className="text-xs text-muted-foreground mb-1">초안 수</p>
                        <p className="font-bold text-foreground">{allDrafts.length}개</p>
                      </div>
                      <div className="bg-background rounded-2xl p-4 border text-center">
                        <p className="text-xs text-muted-foreground mb-1">입력 필드</p>
                        <p className="font-bold text-foreground">{Object.values(latestDraft.fields).filter(Boolean).length}개</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Timer Widget */}
                {deadline ? (
                  <CountdownWidget deadline={deadline} />
                ) : (
                  <div className="bg-foreground text-background rounded-[2rem] p-8 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-background/60 mb-2 uppercase tracking-tight">제출 마감</h3>
                    <div className="text-2xl font-black font-heading">마감 일정 미정</div>
                  </div>
                )}

                <div className="bg-surface rounded-[2rem] p-6 border shadow-sm">
                  <h3 className="font-bold mb-6 flex items-center justify-between">
                    알림 기록 <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded">오늘</span>
                  </h3>
                  <div className="space-y-5">
                    {[
                      { icon: CheckCircle2, bg: "bg-green-500/10", color: "text-green-500", title: "로컬 레포지토리 연동 완료", desc: "상태 관리가 초기화되었습니다." },
                      { icon: AlertCircle, bg: "bg-yellow-500/10", color: "text-yellow-500", title: "발표 자료 준비", desc: "PDF 문서 업로드가 필요합니다." },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className={`mt-0.5 w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-tight mb-1">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="bg-surface border rounded-[2rem] p-8 shadow-sm">
              <div className="flex justify-between items-end mb-8 border-b pb-6">
                <div>
                  <h3 className="text-3xl font-black font-heading mb-2">대원 명부</h3>
                  <p className="text-muted-foreground font-medium">현 {team.memberCount}명 합류 중 (최대 {team.maxSize || 5}명)</p>
                </div>
                {team.isOpen ? (
                  <span className="px-4 py-1.5 bg-green-500/10 text-green-600 font-bold text-sm rounded-full">
                    인원 모집 중
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-muted text-muted-foreground font-bold text-sm rounded-full">
                    모집 마감
                  </span>
                )}
              </div>

              {/* Member count display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: team.memberCount }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 border rounded-2xl hover:border-foreground/30 transition-colors bg-background">
                    <div className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-bold font-heading">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg leading-tight text-foreground">팀원 {i + 1}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{team.lookingFor[i] ?? "멤버"}</p>
                      {i === 0 && <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-foreground/10 text-foreground rounded-md mt-1">팀장(Leader)</span>}
                    </div>
                  </div>
                ))}

                {team.isOpen && Array.from({ length: (team.maxSize || 5) - team.memberCount }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-4 p-5 border border-dashed rounded-2xl bg-muted/20 opacity-60">
                    <div className="w-14 h-14 rounded-full bg-background border border-dashed flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-muted-foreground">공석 (Empty)</h4>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">작전팀원을 기다립니다</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Looking for roles */}
              {team.lookingFor.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-bold mb-3">찾고 있는 역할</h4>
                  <div className="flex flex-wrap gap-2">
                    {team.lookingFor.map((role) => (
                      <span key={role} className="px-3 py-1.5 bg-background border rounded-full text-sm font-bold text-foreground">
                        #{role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "submit" && (
            <div>
              {submitSection ? (
                <SubmissionStudio
                  allowedArtifactTypes={submitSection.allowedArtifactTypes}
                  guide={submitSection.guide}
                  hackathonSlug={team.hackathonSlug}
                  submissionItems={submitSection.submissionItems}
                  title={hackathonDetail?.title ?? team.hackathonSlug}
                />
              ) : (
                <div className="max-w-3xl mx-auto bg-surface border rounded-[2rem] p-8 md:p-12 shadow-sm text-center">
                  <div className="w-20 h-20 bg-foreground text-background rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                    <Send className="w-10 h-10 ml-1 -rotate-3" />
                  </div>
                  <h2 className="text-3xl font-black mb-3 font-heading">프로젝트 최종 제출</h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    이 해커톤의 제출 정보를 불러올 수 없습니다. 해커톤 상세 페이지를 확인해주세요.
                  </p>
                  <Link href={`/hackathons/${team.hackathonSlug}`}>
                    <button className="bg-foreground text-background px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-sm">
                      해커톤 상세 보기
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
