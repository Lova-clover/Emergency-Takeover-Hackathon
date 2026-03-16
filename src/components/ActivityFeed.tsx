'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { getTeams } from '@/lib/data-service';

interface ActivityItem {
  icon: string;
  description: string;
  timestamp: number;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return '방금 전';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${Math.floor(days / 7)}주 전`;
}

function getSeedActivities(): ActivityItem[] {
  const teams = getTeams();
  const items: ActivityItem[] = [];

  teams.forEach((team) => {
    const created = new Date(team.createdAt).getTime();
    items.push({
      icon: '👥',
      description: `${team.name} 팀이 생성되었습니다`,
      timestamp: created,
    });
  });

  // Mock ranking achievements
  const now = Date.now();
  items.push(
    {
      icon: '🏆',
      description: '404found 팀이 리더보드 1위를 달성했습니다',
      timestamp: now - 2 * 60 * 60 * 1000,
    },
    {
      icon: '🏆',
      description: 'Team Alpha가 완성도 92점을 기록했습니다',
      timestamp: now - 5 * 60 * 60 * 1000,
    },
    {
      icon: '📝',
      description: '새로운 해커톤 제출물이 등록되었습니다',
      timestamp: now - 8 * 60 * 60 * 1000,
    },
    {
      icon: '⭐',
      description: 'PromptRunners 팀이 북마크되었습니다',
      timestamp: now - 1 * 24 * 60 * 60 * 1000,
    }
  );

  return items;
}

function getLocalActivities(): ActivityItem[] {
  if (typeof window === 'undefined') return [];
  const items: ActivityItem[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith('bookmark:')) {
        items.push({
          icon: '⭐',
          description: `해커톤이 북마크에 추가되었습니다`,
          timestamp: Date.now() - 30 * 60 * 1000,
        });
      }
      if (key.startsWith('submission-drafts:')) {
        try {
          const drafts = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(drafts)) {
            drafts.forEach((d: { teamName?: string; updatedAt?: string; status?: string }) => {
              if (d.updatedAt) {
                items.push({
                  icon: d.status === 'submitted' ? '📝' : '💾',
                  description: d.status === 'submitted'
                    ? `${d.teamName || '팀'} 제출물이 등록되었습니다`
                    : `${d.teamName || '팀'} 초안이 저장되었습니다`,
                  timestamp: new Date(d.updatedAt).getTime(),
                });
              }
            });
          }
        } catch { /* ignore parse errors */ }
      }
    }
  } catch { /* localStorage unavailable */ }

  return items;
}

const MAX_ITEMS = 8;

export default function ActivityFeed() {
  const [localItems, setLocalItems] = useState<ActivityItem[]>([]);
  const seedItems = useMemo(() => getSeedActivities(), []);

  useEffect(() => {
    setLocalItems(getLocalActivities());

    const handler = () => setLocalItems(getLocalActivities());
    window.addEventListener('submission-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('submission-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const activities = useMemo(() => {
    return [...seedItems, ...localItems]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_ITEMS);
  }, [seedItems, localItems]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const item = {
    hidden: { opacity: 0, x: -12 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <section className="py-16 border-t">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-surface/50 backdrop-blur-md text-sm font-medium mb-4">
            <Activity className="w-4 h-4" />
            실시간 활동 피드
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight">최근 활동</h2>
          <p className="text-muted-foreground mt-2">팀 생성, 제출, 랭킹 변동 등 최근 이벤트를 확인하세요.</p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative pl-8"
        >
          {/* Timeline line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

          {activities.map((act, i) => (
            <motion.div key={`${act.timestamp}-${i}`} variants={item} className="relative mb-5 last:mb-0">
              {/* Dot */}
              <div className="absolute -left-8 top-3 flex h-6 w-6 items-center justify-center">
                <span className="absolute h-3 w-3 rounded-full bg-foreground/20" />
                <span className="absolute h-1.5 w-1.5 rounded-full bg-foreground" />
              </div>

              <div className="rounded-2xl border bg-background p-4 hover:border-foreground/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{act.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{act.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{relativeTime(act.timestamp)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
