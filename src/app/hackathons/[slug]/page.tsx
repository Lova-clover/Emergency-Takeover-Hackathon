"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Users, Trophy, ChevronLeft, Clock, Target,
  ArrowRight, Bookmark, BookmarkCheck, TerminalSquare,
  BarChart3, ClipboardList, Upload, Medal, UserPlus,
  ExternalLink, FileText, AlertCircle, CheckCircle2,
  Circle, ChevronRight, Save, Info,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  getHackathons,
  getHackathonDetail,
  getTeamsByHackathon,
  getLeaderboard,
} from "@/lib/data-service";
import {
  upsertSubmissionDraft,
  getLatestSubmissionDraft,
} from "@/lib/storage";
import {
  formatDate,
  getDDayLabel,
  formatKRW,
  formatScore,
  getRankEmoji,
  getPrizeLabel,
  getPrizeGradient,
  getStatusLabel,
  getStatusColor,
  getMilestoneStatus,
  getRankBg,
} from "@/lib/utils";
import Countdown from "@/components/ui/Countdown";
import type {
  HackathonListItem,
  HackathonDetail,
  TeamItem,
  LeaderboardData,
  LeaderboardEntry,
  SubmissionDraft,
} from "@/types";

/* ─── Tab definitions ─── */
const TABS = [
  { key: "overview", label: "개요", icon: Target },
  { key: "eval", label: "평가", icon: BarChart3 },
  { key: "schedule", label: "일정", icon: Calendar },
  { key: "prize", label: "상금", icon: Trophy },
  { key: "teams", label: "팀", icon: Users },
  { key: "submit", label: "제출", icon: Upload },
  { key: "leaderboard", label: "리더보드", icon: Medal },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ─── Main page ─── */
export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { bookmarks, toggleBookmark, myTeamId, joinTeam } = useUser();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Data
  const hackathon: HackathonListItem | undefined = useMemo(
    () => getHackathons().find((h) => h.slug === slug),
    [slug]
  );
  const detail: HackathonDetail | undefined = useMemo(
    () => getHackathonDetail(slug),
    [slug]
  );
  const [teams, setTeams] = useState<TeamItem[]>(() => getTeamsByHackathon(slug));
  const leaderboardData: LeaderboardData | undefined = useMemo(
    () => getLeaderboard(slug),
    [slug]
  );

  // Handle team join with memberCount update
  const handleJoinTeam = useCallback((teamCode: string) => {
    joinTeam(teamCode);
    setTeams(prev => prev.map(t =>
      t.teamCode === teamCode ? { ...t, memberCount: t.memberCount + 1 } : t
    ));
  }, [joinTeam]);

  // 404
  if (!detail || !hackathon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-20">
        <TerminalSquare className="w-16 h-16 text-muted-foreground" />
        <p className="text-2xl font-black">해커톤을 찾을 수 없습니다.</p>
        <button
          onClick={() => router.push("/hackathons")}
          className="mt-4 px-6 py-3 bg-foreground text-background rounded-xl font-bold hover:scale-105 active:scale-95 transition-all"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const { sections } = detail;
  const isBookmarked = bookmarks.includes(slug);
  const deadline = hackathon.period.submissionDeadlineAt;

  return (
    <div className="min-h-screen pb-24">
      {/* ─── Hero ─── */}
      <div className="relative border-b shadow-sm bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="container mx-auto px-4 pt-10 pb-16 max-w-5xl relative z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm font-bold bg-background border px-4 py-2 rounded-full shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> 목록으로 돌아가기
          </button>

          <div className="flex flex-wrap gap-2 mb-6">
            <span
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5 ${getStatusColor(hackathon.status)}`}
            >
              {hackathon.status !== "ended" && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              )}
              {getStatusLabel(hackathon.status)}
            </span>
            {hackathon.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-background border text-foreground text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black font-heading leading-tight tracking-tight mb-8 max-w-4xl text-foreground">
            {detail.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-muted-foreground font-medium">
            <div className="flex items-center gap-2 bg-background border px-4 py-2 rounded-xl shadow-sm">
              <Calendar className="w-5 h-5 text-foreground" />
              <span>
                마감:{" "}
                <span className="text-foreground font-bold">
                  {formatDate(deadline)} ({getDDayLabel(deadline)})
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-background border px-4 py-2 rounded-xl shadow-sm">
              <Users className="w-5 h-5 text-foreground" />
              <span>
                참가:{" "}
                <span className="text-foreground font-bold">
                  {sections.overview.teamPolicy.allowSolo ? "개인" : "팀"} 또는 최대{" "}
                  {sections.overview.teamPolicy.maxTeamSize}인 팀
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-foreground text-background shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="container mx-auto px-4 mt-8 max-w-5xl relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && (
                  <OverviewTab sections={sections} />
                )}
                {activeTab === "eval" && <EvalTab sections={sections} />}
                {activeTab === "schedule" && (
                  <ScheduleTab sections={sections} />
                )}
                {activeTab === "prize" && <PrizeTab sections={sections} />}
                {activeTab === "teams" && (
                  <TeamsTab
                    teams={teams}
                    slug={slug}
                    myTeamId={myTeamId}
                    joinTeam={handleJoinTeam}
                    campEnabled={sections.teams.campEnabled}
                  />
                )}
                {activeTab === "submit" && (
                  <SubmitTab sections={sections} slug={slug} />
                )}
                {activeTab === "leaderboard" && (
                  <LeaderboardTab
                    leaderboardData={leaderboardData}
                    sections={sections}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── Sticky Sidebar ─── */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-surface rounded-[2rem] p-8 shadow-sm border overflow-hidden relative"
              >
                <h3 className="text-xl font-black mb-6 font-heading border-b pb-4">
                  마감 카운트다운
                </h3>
                <div className="mb-6">
                  <Countdown targetDate={deadline} label="제출 마감까지" />
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    {formatDate(deadline)} ({getDDayLabel(deadline)})
                  </p>
                </div>

                <div className="space-y-5 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 bg-background border p-2.5 rounded-xl text-foreground">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase mb-0.5">
                        제출 마감
                      </p>
                      <p className="font-bold text-sm">
                        {formatDate(deadline)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 bg-background border p-2.5 rounded-xl text-foreground">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase mb-0.5">
                        참가 형태
                      </p>
                      <p className="font-bold text-sm">
                        {sections.overview.teamPolicy.allowSolo
                          ? "개인 또는 "
                          : ""}
                        최대 {sections.overview.teamPolicy.maxTeamSize}인 팀
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 bg-background border p-2.5 rounded-xl text-foreground">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase mb-0.5">
                        참가 팀
                      </p>
                      <p className="font-bold text-sm">{teams.length}개 팀</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("teams")}
                    className="w-full bg-foreground text-background py-4 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/10 flex items-center justify-center gap-2 group"
                  >
                    참가 신청하기
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => toggleBookmark(slug)}
                    aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
                    aria-pressed={isBookmarked}
                    className={`w-full py-4 rounded-xl font-bold text-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      isBookmarked
                        ? "border-foreground bg-background text-foreground"
                        : "border-border bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                    {isBookmarked ? "북마크 됨" : "북마크 저장"}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface rounded-[2rem] p-6 shadow-sm border"
              >
                <h3 className="text-sm font-black mb-4 uppercase tracking-wider text-muted-foreground">
                  공식 문서
                </h3>
                <div className="space-y-2">
                  <a
                    href={sections.info.links.rules}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-background border hover:border-foreground/30 transition-colors text-sm font-bold group"
                  >
                    대회 규정 확인
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                  <a
                    href={sections.info.links.faq}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-background border hover:border-foreground/30 transition-colors text-sm font-bold group"
                  >
                    자주 묻는 질문 (FAQ)
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   1. Overview Tab
   ════════════════════════════════════════════════════ */
function OverviewTab({ sections }: { sections: HackathonDetail["sections"] }) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-foreground font-heading">
          <Target className="w-6 h-6 text-muted-foreground" /> 대회 소개
        </h2>
        <p className="text-muted-foreground font-medium leading-relaxed text-lg">
          {sections.overview.summary}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-background border px-5 py-3 rounded-2xl">
            <Users className="w-5 h-5 text-foreground" />
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                팀 구성
              </p>
              <p className="font-bold text-sm">
                {sections.overview.teamPolicy.allowSolo
                  ? "개인 참가 가능"
                  : "팀 참가만 가능"}{" "}
                · 최대 {sections.overview.teamPolicy.maxTeamSize}인
              </p>
            </div>
          </div>
        </div>
      </Card>

      {sections.info.notice.length > 0 && (
        <Card>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-foreground font-heading">
            <Info className="w-6 h-6 text-muted-foreground" /> 유의사항
          </h2>
          <ul className="space-y-3">
            {sections.info.notice.map((n, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-4 bg-background border rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-muted-foreground">
                  {n}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   2. Evaluation Tab
   ════════════════════════════════════════════════════ */
function EvalTab({ sections }: { sections: HackathonDetail["sections"] }) {
  const { eval: ev } = sections;
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-foreground font-heading">
          <BarChart3 className="w-6 h-6 text-muted-foreground" /> 평가 기준
        </h2>
        <div className="space-y-6">
          <div className="p-5 bg-background border rounded-2xl">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">
              평가 지표
            </p>
            <p className="text-xl font-black text-foreground">
              {ev.metricName}
            </p>
          </div>
          <p className="text-muted-foreground font-medium leading-relaxed">
            {ev.description}
          </p>

          {ev.scoreDisplay && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-foreground">
                {ev.scoreDisplay.label} 구성
              </h3>
              <div className="grid gap-3">
                {ev.scoreDisplay.breakdown.map((b) => (
                  <div
                    key={b.key}
                    className="flex items-center gap-4 p-4 bg-background border rounded-2xl"
                  >
                    <div className="w-14 h-14 rounded-xl bg-foreground text-background flex items-center justify-center text-lg font-black">
                      {b.weightPercent}%
                    </div>
                    <div>
                      <p className="font-bold">{b.label}</p>
                      <p className="text-xs text-muted-foreground">
                        가중치 {b.weightPercent}%
                      </p>
                    </div>
                    {/* visual bar */}
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden ml-auto max-w-[200px]">
                      <div
                        className="h-full bg-foreground rounded-full transition-all"
                        style={{ width: `${b.weightPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ev.limits && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-background border rounded-2xl text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">
                  최대 실행 시간
                </p>
                <p className="text-2xl font-black text-foreground">
                  {ev.limits.maxRuntimeSec}초
                </p>
              </div>
              <div className="p-4 bg-background border rounded-2xl text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">
                  일일 제출 제한
                </p>
                <p className="text-2xl font-black text-foreground">
                  {ev.limits.maxSubmissionsPerDay}회
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   3. Schedule Tab
   ════════════════════════════════════════════════════ */
function ScheduleTab({ sections }: { sections: HackathonDetail["sections"] }) {
  const milestones = sections.schedule.milestones;
  return (
    <Card>
      <h2 className="text-2xl font-black mb-8 flex items-center gap-2 text-foreground font-heading">
        <Calendar className="w-6 h-6 text-muted-foreground" /> 일정
      </h2>
      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-6">
        타임존: {sections.schedule.timezone}
      </p>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />
        <div className="space-y-0">
          {milestones.map((ms, i) => {
            const status = getMilestoneStatus(ms.at);
            return (
              <div key={i} className="flex items-start gap-5 relative py-4">
                {/* Dot */}
                <div className="relative z-10 flex-shrink-0">
                  {status === "past" && (
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 bg-surface rounded-full p-1" />
                  )}
                  {status === "current" && (
                    <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center animate-pulse">
                      <Circle className="w-5 h-5" />
                    </div>
                  )}
                  {status === "future" && (
                    <Circle className="w-10 h-10 text-muted-foreground/40 bg-surface rounded-full p-1" />
                  )}
                </div>
                {/* Content */}
                <div
                  className={`flex-1 p-4 rounded-2xl border transition-colors ${
                    status === "current"
                      ? "bg-foreground/5 border-foreground/20 shadow-sm"
                      : status === "past"
                      ? "bg-background border-border opacity-70"
                      : "bg-background border-border"
                  }`}
                >
                  <p className="font-bold text-foreground">{ms.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(ms.at)}{" "}
                    <span className="font-bold">
                      ({getDDayLabel(ms.at)})
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/* ════════════════════════════════════════════════════
   4. Prize Tab
   ════════════════════════════════════════════════════ */
function PrizeTab({ sections }: { sections: HackathonDetail["sections"] }) {
  const totalPrize = sections.prize.items.reduce(
    (sum, p) => sum + p.amountKRW,
    0
  );
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-foreground font-heading">
          <Trophy className="w-6 h-6 text-muted-foreground" /> 시상 내역
        </h2>
        <div className="p-5 bg-background border rounded-2xl mb-8 text-center">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">
            총 상금
          </p>
          <p className="text-3xl font-black text-foreground">
            {formatKRW(totalPrize)}
          </p>
        </div>
        <ul className="space-y-4">
          {sections.prize.items.map((p) => (
            <li
              key={p.place}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-background border rounded-2xl shadow-sm overflow-hidden relative"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getPrizeGradient(p.place)}`}
              />
              <span className="font-bold text-lg mb-2 sm:mb-0 ml-4">
                {getPrizeLabel(p.place)}
              </span>
              <span className="text-foreground font-black text-2xl tracking-tight">
                {formatKRW(p.amountKRW)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   5. Teams Tab
   ════════════════════════════════════════════════════ */
function TeamsTab({
  teams,
  slug,
  myTeamId,
  joinTeam,
  campEnabled,
}: {
  teams: TeamItem[];
  slug: string;
  myTeamId: string | null;
  joinTeam: (id: string) => void;
  campEnabled: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-foreground font-heading">
          <Users className="w-6 h-6 text-muted-foreground" /> 참가 팀 목록
        </h2>
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground font-medium">
            총 <span className="text-foreground font-bold">{teams.length}</span>
            개 팀
          </p>
          {campEnabled && (
            <Link
              href={`/teams`}
              className="text-sm font-bold text-foreground flex items-center gap-1 hover:underline"
            >
              팀 만들기 <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        {teams.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-bold">아직 등록된 팀이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => {
              const isMyTeam = myTeamId === team.teamCode;
              return (
                <div
                  key={team.teamCode}
                  className={`p-5 rounded-2xl border transition-all ${
                    isMyTeam
                      ? "bg-foreground/5 border-foreground/20 shadow-sm"
                      : "bg-background border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-lg text-foreground">
                          {team.name}
                        </h3>
                        {isMyTeam && (
                          <span className="text-[10px] font-bold bg-foreground text-background px-2 py-0.5 rounded-full">
                            내 팀
                          </span>
                        )}
                        {team.isOpen ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            모집중
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                            마감
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {team.memberCount}/{team.maxSize ?? "∞"}명
                      </p>
                    </div>
                    {team.isOpen && !isMyTeam && (
                      <button
                        onClick={() => joinTeam(team.teamCode)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all"
                      >
                        <UserPlus className="w-4 h-4" /> 참가
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {team.intro}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {team.lookingFor.map((role) => (
                      <span
                        key={role}
                        className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-lg"
                      >
                        {role}
                      </span>
                    ))}
                    <a
                      href={team.contact.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs font-bold text-foreground flex items-center gap-1 hover:underline"
                    >
                      연락하기 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   6. Submit Tab
   ════════════════════════════════════════════════════ */
function SubmitTab({
  sections,
  slug,
}: {
  sections: HackathonDetail["sections"];
  slug: string;
}) {
  const { submit } = sections;
  const submissionItems = submit.submissionItems ?? [];

  const [fields, setFields] = useState<Record<string, string>>({});
  const [teamName, setTeamName] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [draftId, setDraftId] = useState<string | undefined>();

  // Load draft from localStorage
  useEffect(() => {
    const draft = getLatestSubmissionDraft(slug);
    if (draft) {
      setFields(draft.fields);
      setTeamName(draft.teamName);
      setNotes(draft.notes);
      setDraftId(draft.id);
    }
  }, [slug]);

  const handleSave = useCallback(() => {
    const result = upsertSubmissionDraft({
      id: draftId,
      hackathonSlug: slug,
      teamName,
      notes,
      status: "draft",
      fields,
    });
    setDraftId(result.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [draftId, slug, teamName, notes, fields]);

  const updateField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-foreground font-heading">
          <Upload className="w-6 h-6 text-muted-foreground" /> 제출 가이드
        </h2>
        <ul className="space-y-3 mb-6">
          {submit.guide.map((g, i) => (
            <li
              key={i}
              className="flex items-start gap-3 p-4 bg-background border rounded-xl"
            >
              <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {g}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mr-2 self-center">
            허용 형식:
          </p>
          {submit.allowedArtifactTypes.map((t) => (
            <span
              key={t}
              className="px-3 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-lg uppercase"
            >
              {t}
            </span>
          ))}
        </div>
      </Card>

      {submissionItems.length > 0 && (
        <Card>
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-foreground font-heading">
            <ClipboardList className="w-5 h-5 text-muted-foreground" /> 제출
            항목
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                팀 이름
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="팀 이름을 입력하세요"
                className="w-full px-4 py-3 bg-background border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
              />
            </div>

            {submissionItems.map((item) => (
              <div key={item.key}>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {item.title}{" "}
                  <span className="normal-case text-muted-foreground/60">
                    ({item.format})
                  </span>
                </label>
                <input
                  type={item.format.includes("url") ? "url" : "text"}
                  value={fields[item.key] ?? ""}
                  onChange={(e) => updateField(item.key, e.target.value)}
                  placeholder={
                    item.format.includes("url")
                      ? "https://..."
                      : `${item.title}을 입력하세요`
                  }
                  className="w-full px-4 py-3 bg-background border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                메모
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="추가 메모 (선택사항)"
                rows={3}
                className="w-full px-4 py-3 bg-background border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                saved
                  ? "bg-emerald-500 text-white"
                  : "bg-foreground text-background hover:scale-105 active:scale-95 shadow-xl shadow-foreground/10"
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> 저장됨!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> 임시 저장
                </>
              )}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   7. Leaderboard Tab
   ════════════════════════════════════════════════════ */
function LeaderboardTab({
  leaderboardData,
  sections,
}: {
  leaderboardData: LeaderboardData | undefined;
  sections: HackathonDetail["sections"];
}) {
  const entries = leaderboardData?.entries ?? [];
  const hasBreakdown = entries.some((e) => e.scoreBreakdown);
  const breakdownKeys = sections.eval.scoreDisplay?.breakdown;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-black mb-2 flex items-center gap-2 text-foreground font-heading">
          <Medal className="w-6 h-6 text-muted-foreground" /> 리더보드
        </h2>
        {leaderboardData && (
          <p className="text-xs text-muted-foreground font-medium mb-6">
            최종 업데이트: {formatDate(leaderboardData.updatedAt)}
          </p>
        )}
        {sections.leaderboard.note && (
          <div className="p-4 bg-background border rounded-xl mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground font-medium">
              {sections.leaderboard.note}
            </p>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Medal className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-bold">아직 리더보드 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className={`p-5 rounded-2xl border transition-all ${getRankBg(entry.rank)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black w-12 text-center flex-shrink-0">
                    {getRankEmoji(entry.rank)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg text-foreground truncate">
                      {entry.teamName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      제출: {formatDate(entry.submittedAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-black text-foreground tabular-nums">
                      {formatScore(entry.score)}
                    </p>
                    {entry.scoreBreakdown && breakdownKeys && (
                      <div className="flex gap-3 mt-1 justify-end">
                        {breakdownKeys.map((bk) => (
                          <span
                            key={bk.key}
                            className="text-xs text-muted-foreground"
                          >
                            {bk.label}{" "}
                            <span className="font-bold text-foreground">
                              {entry.scoreBreakdown?.[
                                bk.key as keyof typeof entry.scoreBreakdown
                              ] ?? "-"}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {entry.artifacts && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-16">
                    {entry.artifacts.webUrl && (
                      <a
                        href={entry.artifacts.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-background border rounded-lg text-xs font-bold hover:border-foreground/30 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> 웹사이트
                      </a>
                    )}
                    {entry.artifacts.pdfUrl && (
                      <a
                        href={entry.artifacts.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-background border rounded-lg text-xs font-bold hover:border-foreground/30 transition-colors"
                      >
                        <FileText className="w-3 h-3" /> PDF
                      </a>
                    )}
                    {entry.artifacts.planTitle && (
                      <span className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-bold">
                        {entry.artifacts.planTitle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── Shared Card wrapper ─── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-[2rem] p-8 md:p-12 shadow-sm border">
      {children}
    </div>
  );
}