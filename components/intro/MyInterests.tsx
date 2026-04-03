"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderTreeNode } from "@/types/tree";
import { useInView } from "./useInView";

interface InterestCard {
  name: string;
  fileCount: number;
  icon: string;
  color: string;
}

const ICON_MAP: Record<string, string> = {
  건강: "💪",
  과학: "🔬",
  영성: "🌿",
  리더십: "🧭",
  철학: "💭",
  경제: "📊",
  AI: "🤖",
  기술: "⚙️",
  심리: "🧠",
  글쓰기: "✍️",
  독서: "📚",
  소개: "🌲",
  생각: "💡",
  프로젝트: "🚀",
};

const COLOR_PALETTE = [
  "var(--accent)",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#f97316",
  "#14b8a6",
];

function getIcon(name: string) {
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (name.includes(key)) return icon;
  }
  return "🌳";
}

function getColor(index: number) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export default function MyInterests() {
  const [cards, setCards] = useState<InterestCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView(0.1);

  useEffect(() => {
    fetch("/api/tree")
      .then((r) => r.json())
      .then((data: FolderTreeNode[]) => {
        // Top-level folders
        const folders = data.filter((n) => n.type === "folder");

        if (folders.length > 0) {
          const result: InterestCard[] = folders.map((folder, i) => {
            const fileCount = (folder.children ?? []).filter((c) => c.type === "file").length;
            return {
              name: folder.name,
              fileCount,
              icon: getIcon(folder.name),
              color: getColor(i),
            };
          });
          setCards(result);
        } else {
          // Fallback hardcoded
          setCards(
            ["건강", "과학", "영성", "리더십", "철학", "AI", "독서", "글쓰기"].map((name, i) => ({
              name,
              fileCount: Math.floor(Math.random() * 8) + 1,
              icon: getIcon(name),
              color: getColor(i),
            }))
          );
        }
      })
      .catch(() => {
        setCards(
          ["건강", "과학", "영성", "리더십"].map((name, i) => ({
            name,
            fileCount: 0,
            icon: getIcon(name),
            color: getColor(i),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.07 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <section
      id="intro-interests"
      ref={ref as React.RefObject<HTMLElement>}
      className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 bg-[var(--bg)]"
    >
      <div className="max-w-5xl w-full">
        {/* Section label */}
        <motion.div
          className="flex items-center gap-3 mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-0.5 bg-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-widest">
            Interests
          </span>
        </motion.div>

        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          내 관심사
        </motion.h2>

        <motion.p
          className="text-[var(--text-muted)] mb-12 max-w-xl"
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          숲의 각 구역은 내가 오랫동안 탐색해온 주제들입니다.
        </motion.p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {cards.map((card, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 cursor-default overflow-hidden transition-shadow hover:shadow-lg"
              >
                {/* Accent corner decoration */}
                <div
                  className="absolute top-0 right-0 w-16 h-16 rounded-bl-3xl opacity-10 transition-opacity group-hover:opacity-20"
                  style={{ background: card.color }}
                />

                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-[var(--text)] text-sm mb-1">{card.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {card.fileCount > 0 ? `${card.fileCount}개의 글` : "탐색 중"}
                </p>

                {/* Bottom accent bar */}
                <div
                  className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                  style={{ background: card.color }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
