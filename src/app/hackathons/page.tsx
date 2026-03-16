"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Layers, Zap, Clock, Bookmark, BookmarkCheck, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { HackathonListItem } from "@/types";
import { getHackathons } from "@/lib/data-service";
import { formatDate, getDDayLabel, getStatusLabel, getStatusColor } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

const STATUS_OPTIONS = [
  { value: "all", label: "모든 상태" },
  { value: "ongoing", label: "진행중" },
  { value: "upcoming", label: "예정" },
  { value: "ended", label: "종료" },
] as const;

export default function HackathonsPage() {
  const hackathons: HackathonListItem[] = useMemo(() => getHackathons(), []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { bookmarks, toggleBookmark } = useUser();

  const filteredData = useMemo(() => {
    return hackathons.filter(h => {
      if (statusFilter !== "all" && h.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!h.title.toLowerCase().includes(q) && !h.tags.some(t => t.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [hackathons, statusFilter, search]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background font-bold text-xs rounded-full mb-6 shadow-sm uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-background" /> Event Explorer
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 text-foreground tracking-tighter">
            해커톤 탐색 <span className="text-muted-foreground">허브</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl font-medium">
            가장 혁신적인 아이디어가 탄생하는 곳. 현재 진행 중이거나 곧 시작할 해커톤을 찾아 도전해보세요.
          </p>
        </motion.div>
      </div>

      {/* Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-surface/80 backdrop-blur-md border rounded-[2rem] p-3 mb-10 flex flex-col md:flex-row gap-4 shadow-sm top-20 z-10 sticky"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 font-bold" />
          <input
            type="text"
            className="w-full bg-background border rounded-full pl-12 pr-4 py-3.5 outline-none focus:ring-2 ring-foreground/20 transition-all font-bold placeholder:font-normal text-sm"
            placeholder="해커톤 이름, 기술 스택 검색.."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select
              className="w-full appearance-none bg-background border rounded-full px-6 py-3.5 outline-none font-bold text-sm cursor-pointer focus:ring-2 focus:ring-foreground/20 text-foreground"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex bg-background border rounded-full p-1 h-[52px]" role="group" aria-label="보기 모드 전환">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="그리드 보기"
              aria-pressed={viewMode === 'grid'}
              className={`w-12 flex items-center justify-center rounded-full transition-colors relative ${viewMode === 'grid' ? 'text-background' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {viewMode === 'grid' && <motion.div layoutId="view-mode" className="absolute inset-0 bg-foreground rounded-full" />}
              <LayoutGrid className="w-5 h-5 relative z-10" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              aria-label="리스트 보기"
              aria-pressed={viewMode === 'list'}
              className={`w-12 flex items-center justify-center rounded-full transition-colors relative ${viewMode === 'list' ? 'text-background' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {viewMode === 'list' && <motion.div layoutId="view-mode" className="absolute inset-0 bg-foreground rounded-full" />}
              <List className="w-5 h-5 relative z-10" />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        layout
        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
      >
        <AnimatePresence mode="popLayout">
          {filteredData.map((hackathon, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              key={hackathon.slug}
              className={`group bg-surface border rounded-[2rem] overflow-hidden hover:border-foreground/40 transition-all shadow-sm hover:shadow-md ${
                viewMode === 'list' ? 'flex flex-col md:flex-row' : 'flex flex-col'
              }`}
            >
              <div className={`${viewMode === 'list' ? 'w-full md:w-80 h-48 md:h-auto border-r' : 'w-full h-52 border-b'} relative bg-muted flex-shrink-0 overflow-hidden`}>
                {hackathon.thumbnailUrl ? (
                  <img
                    src={hackathon.thumbnailUrl}
                    alt={hackathon.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 saturate-0 group-hover:saturate-100"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : null}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-muted -z-10 group-hover:scale-105 transition-transform duration-500">
                  <Layers className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 ${getStatusColor(hackathon.status)}`}>
                    {hackathon.status === 'ongoing' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    {getStatusLabel(hackathon.status)}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); toggleBookmark(hackathon.slug); }}
                  aria-label={bookmarks.includes(hackathon.slug) ? `${hackathon.title} 북마크 제거` : `${hackathon.title} 북마크 추가`}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-background/80 backdrop-blur-md hover:bg-background transition-colors shadow-sm"
                >
                  {bookmarks.includes(hackathon.slug) ?
                    <BookmarkCheck className="w-5 h-5 text-foreground" /> :
                    <Bookmark className="w-5 h-5 text-foreground" />
                  }
                </button>
              </div>

              <div className="p-7 flex flex-col flex-1 bg-background">
                <div className="flex gap-2 flex-wrap mb-4">
                  {hackathon.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-surface border text-foreground rounded-md">
                      {tag}
                    </span>
                  ))}
                  {hackathon.tags.length > 3 && <span className="text-[10px] font-bold px-2.5 py-1 bg-muted text-muted-foreground rounded-md">+{hackathon.tags.length - 3}</span>}
                </div>

                <h3 className="text-2xl font-black font-heading mb-3 line-clamp-2 leading-tight tracking-tight">
                  {hackathon.title}
                </h3>

                <div className="mt-auto pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(hackathon.period.submissionDeadlineAt)} 마감</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-muted text-[10px] font-black">
                      {getDDayLabel(hackathon.period.submissionDeadlineAt)}
                    </span>
                  </div>

                  <Link href={`/hackathons/${hackathon.slug}`}>
                    <button className="text-sm font-bold bg-foreground text-background px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-foreground/10">
                      상세보기
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredData.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 flex flex-col items-center justify-center text-center px-4 border-2 border-dashed rounded-[3rem] bg-surface/50 mt-10">
          <div className="w-24 h-24 rounded-[2rem] bg-background border shadow-sm rotate-6 flex items-center justify-center mb-8">
            <Search className="w-10 h-10 text-muted-foreground -rotate-6" />
          </div>
          <h2 className="text-3xl font-black mb-4 font-heading tracking-tight">검색 결과가 없습니다</h2>
          <p className="text-muted-foreground text-lg max-w-md font-medium">
            조건을 변경하여 다시 검색해보세요.<br/>새로운 해커톤이 지속적으로 업데이트됩니다.
          </p>
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); }}
            className="mt-8 px-8 py-4 bg-foreground text-background rounded-xl font-bold transition-all hover:scale-105 shadow-xl shadow-foreground/10"
          >
            필터 초기화
          </button>
        </motion.div>
      )}
    </div>
  );
}
