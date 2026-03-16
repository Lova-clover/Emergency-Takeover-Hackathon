"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileText, Workflow, X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SourceDoc {
  title: string;
  file: string;
  description: string;
  note: string;
  icon: typeof FileText;
}

const DOCUMENTS: SourceDoc[] = [
  {
    title: "개발자의 메모",
    file: "/source/memo.png",
    description:
      "사라진 개발자가 남긴 손글씨 메모. 서비스의 핵심 구조와 긴급 인수인계 사항이 빠르게 적혀 있습니다.",
    note: '"이걸 보면 알 거야… 시간이 없었어."',
    icon: FileText,
  },
  {
    title: "UI 흐름도",
    file: "/source/ui-flow.png",
    description:
      "화이트보드에 그려진 UI 흐름도. 페이지 간 네비게이션과 데이터 흐름을 대략적으로 보여줍니다.",
    note: '"이 흐름대로 만들면 돼. 나머진 맡길게."',
    icon: Workflow,
  },
];

export default function SourcePage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          현황판으로 돌아가기
        </Link>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground mb-3">
            📂 인수인계 자료실
          </h1>
          <p className="text-muted-foreground max-w-xl leading-relaxed">
            사라진 개발자가 남긴 유일한 자료들입니다. 이 문서들만으로 서비스를
            파악하고 복구해야 합니다.
          </p>
          <div className="mt-4 inline-block bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-semibold px-3 py-1.5 rounded-full">
            🕵️ 개발자의 흔적 · Developer&apos;s Traces
          </div>
        </motion.div>

        {/* Document Cards */}
        <div className="space-y-10">
          {DOCUMENTS.map((doc, i) => {
            const Icon = doc.icon;
            return (
              <motion.article
                key={doc.file}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
                className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Sticky-note style header */}
                <div className="px-6 pt-5 pb-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">{doc.title}</h2>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                </div>

                {/* Handwritten quote */}
                <div className="px-6 pb-4">
                  <p className="italic text-sm text-muted-foreground border-l-2 border-yellow-500/40 pl-3">
                    {doc.note}
                  </p>
                </div>

                {/* Image */}
                <div className="relative group">
                  <button
                    onClick={() => setLightbox(doc.file)}
                    className="block w-full relative cursor-zoom-in"
                  >
                    <Image
                      src={doc.file}
                      alt={doc.title}
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                      priority={i === 0}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox}
                alt="Source document"
                width={1920}
                height={1280}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
