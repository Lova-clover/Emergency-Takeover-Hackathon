"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Users,
  Trophy,
  FileSearch,
  FileText,
  Clock,
  ChevronRight,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { getFeaturedHackathon, getHackathons, getTeams, getAllLeaderboards } from "@/lib/data-service";
import { useCountdown } from "@/hooks/useCountdown";
import ActivityFeed from "@/components/ActivityFeed";

function StatBadge({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-3">
      <span className="text-2xl md:text-3xl font-black font-heading">{value}</span>
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-background/60 backdrop-blur rounded-xl px-4 py-3 min-w-[64px]">
      <span className="text-2xl font-black font-heading tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function HomePage() {
  const hackathons = useMemo(() => getHackathons(), []);
  const teams = useMemo(() => getTeams(), []);
  const leaderboards = useMemo(() => getAllLeaderboards(), []);
  const featured = useMemo(() => getFeaturedHackathon(), []);

  const totalLeaderboardEntries = useMemo(
    () => leaderboards.reduce((sum, lb) => sum + (lb.entries?.length ?? 0), 0),
    [leaderboards]
  );

  const countdownTarget = featured?.period?.submissionDeadlineAt ?? featured?.period?.endAt ?? "";
  const countdown = useCountdown(countdownTarget);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  const features = [
    { title: "해커톤 탐색", desc: "진행 중인 해커톤을 둘러보고 참가 전략을 세우세요.", href: "/hackathons", icon: Compass, span: "md:col-span-3" },
    { title: "팀 빌딩 캠프", desc: "팀원을 모집하거나 오픈된 팀에 합류하세요.", href: "/teams", icon: Users, span: "md:col-span-3" },
    { title: "실시간 랭킹", desc: "리더보드를 확인하고 경쟁 현황을 파악하세요.", href: "/rankings", icon: Trophy, span: "md:col-span-2" },
    { title: "인수인계 감사", desc: "프로젝트 문서와 인사이트를 분석하세요.", href: "/insights", icon: FileSearch, span: "md:col-span-2" },
    { title: "인수인계 자료실", desc: "전임 개발자가 남긴 메모와 UI 흐름도를 확인하세요.", href: "/source", icon: FileText, span: "md:col-span-2" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-foreground/5 dark:bg-foreground/10 rounded-[100%] blur-[120px] -z-10 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto text-center space-y-8">
            <motion.div variants={item}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-surface/50 backdrop-blur-md text-sm font-medium mb-4">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                긴급 인수인계 상황실 가동 중
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </motion.div>

            <motion.div variants={item}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tighter leading-[1.1]">
                긴급 인수인계<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">상황실</span>
              </h1>
            </motion.div>

            <motion.div variants={item}>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                전임 개발자는 문서만 남기고 떠났습니다.<br />
                인수인계 문서만으로 프로젝트를 완벽하게 복구하세요.
              </p>
            </motion.div>

            {/* Live Stats */}
            <motion.div variants={item} className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
              <div className="inline-flex items-center divide-x divide-border border rounded-2xl bg-surface/50 backdrop-blur-md">
                <StatBadge value={hackathons.length} label="해커톤" />
                <StatBadge value={teams.length} label="팀" />
                <StatBadge value={totalLeaderboardEntries} label="랭킹 엔트리" />
              </div>
            </motion.div>

            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/hackathons">
                <button className="h-14 px-8 bg-foreground text-background rounded-full font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2">
                  해커톤 탐색하기 <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </Link>
              <Link href="/teams">
                <button className="h-14 px-8 border-2 border-border bg-surface text-foreground rounded-full font-bold text-lg hover:bg-muted transition-all flex items-center justify-center gap-2">
                  팀에 합류하기 <Users className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Hackathon */}
      {featured && (
        <section className="py-16 border-t">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative border border-border rounded-3xl p-8 md:p-12 bg-surface/50 overflow-hidden"
            >
              <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" /> Featured
              </div>

              <h2 className="text-2xl md:text-3xl font-black font-heading tracking-tight mb-3">{featured.title}</h2>
              <p className="text-muted-foreground mb-6 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                인수인계 마감까지 남은 시간
              </p>

              {!countdown.isExpired ? (
                <div className="flex items-center gap-3 mb-8 flex-wrap">
                  <CountdownBlock value={countdown.days} label="일" />
                  <CountdownBlock value={countdown.hours} label="시간" />
                  <CountdownBlock value={countdown.minutes} label="분" />
                  <CountdownBlock value={countdown.seconds} label="초" />
                </div>
              ) : (
                <div className="mb-8 text-lg font-bold text-red-500">마감되었습니다</div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {featured.tags?.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-muted rounded-full text-sm font-medium">{tag}</span>
                ))}
              </div>

              <Link href={`/hackathons/${featured.slug}`}>
                <button className="px-6 py-3 bg-foreground text-background rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
                  상세 보기 <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Activity Feed */}
      <ActivityFeed />

      {/* Feature Cards – bento-box */}
      <section className="py-24 bg-surface/50 border-t relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">인수인계 상황실 기능</h2>
            <p className="text-xl text-muted-foreground">문서만으로 프로젝트를 되살려야 합니다. 모든 도구가 준비되어 있습니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Link key={feat.href} href={feat.href} className={`${feat.span} group`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="h-full bg-background border rounded-3xl p-10 hover:border-foreground/20 transition-colors"
                  >
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{feat.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{feat.desc}</p>
                    <div className="mt-6 text-sm font-bold text-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      바로가기 <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}

            {/* CTA card */}
            <div className="md:col-span-6 bg-foreground text-background flex flex-col justify-center items-center text-center rounded-3xl p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 justify-center mb-4">
                  <Clock className="w-6 h-6" />
                  <span className="text-sm font-bold uppercase tracking-wider">Emergency Protocol Active</span>
                </div>
                <h3 className="text-3xl font-black font-heading mb-4">지금 바로 복구를 시작하세요</h3>
                <p className="text-background/80 text-lg mb-8 max-w-lg">
                  전임자가 남긴 인수인계 문서를 분석하고, 팀을 꾸리고, 프로젝트를 다시 살려내세요.
                </p>
                <Link href="/hackathons">
                  <button className="px-8 py-4 bg-background text-foreground rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                    상황실 입장 <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
